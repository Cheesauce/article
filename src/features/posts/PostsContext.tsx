
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Post, PostSection } from './types';
import { persistence } from '../../utils/persistence';

type Tally = Record<string, number>;

type PostsContextValue = {
  posts: Post[];
  loading: boolean;
  addPost: (p: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'hearts'>) => Promise<Post>;
  updatePost: (id: string, patch: Partial<Post>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  toggleHeart: (id: string) => Promise<void>;
  heartedIds: Record<string, boolean>;
  tagClicks: Tally;
  recordTagClick: (tag: string) => Promise<void>;
  folderClicks: Tally;
  recordFolderClick: (folder: string) => Promise<void>;
};

const PostsContext = createContext<PostsContextValue | null>(null);

const POSTS_KEY = 'tracktt.posts.v4';
const TAG_CLICKS_KEY = 'tracktt.tagClicks.v1';
const FOLDER_CLICKS_KEY = 'tracktt.folderClicks.v1';
const HEARTED_KEY = 'tracktt.hearted.v1';

const seedPosts: Post[] = [
  {
    id: 'seed-1',
    title: 'Bitcoin at $67K — The Thesis, The Signal',
    sections: [
      {
        heading: 'The Thesis',
        body: 'Sound money is, in the end, a discipline of character. A civilization that lowers its time preference builds cathedrals, libraries, and long-dated infrastructure. When money is debased, the calculus of patience inverts — we consume the future to survive the present. Bitcoin is the first politically neutral bearer asset with a fixed supply schedule, and that scarcity is not a feature of code alone — it is the cumulative work of every node that refuses to blink.',
      },
      {
        heading: 'The Receipt',
        body: 'Position opened at $67,400 with a 5-year horizon. I am not trading this — I am sitting with it. If the thesis is wrong, it is wrong about human nature, not about a chart. Revisit: halving cycle + 18 months.',
        conviction: 92,
      },
    ],
    tags: [
      { label: 'Champion', value: 'Satoshi Nakamoto' },
      { label: 'Proxy', value: 'BTC' },
      { label: 'Price', value: '$67,400' },
    ],
    folder: 'Theses',
    createdAt: Date.now() - 1000 * 60 * 60 * 72,
    updatedAt: Date.now() - 1000 * 60 * 60 * 72,
    published: true,
    replyToId: null,
    hearts: 42,
    aiModel: 'gpt-4o',
  },
  {
    id: 'seed-2',
    title: 'Tesla — Long the Operator, Not the Narrative',
    sections: [
      {
        heading: 'The Thesis',
        body: 'There is a certain calm among people who have thought through their positions. They do not need to convince you. They have done the reading, the stress testing, the mental rehearsal of drawdowns. The Tesla position is not about quarterly deliveries — it is a bet on an operator who compounds engineering advantages across automotive, energy, and autonomy. Conviction is not volume — it is preparation.',
      },
      {
        heading: 'The Receipt',
        body: 'Entry $392. Horizon: 5–10 years. Sizing is deliberate — large enough to matter, small enough to sleep. I will not average down on narrative; I will average down on fundamentals if margins compress for the right reasons.',
        conviction: 78,
      },
    ],
    tags: [
      { label: 'Champion', value: 'Elon Musk' },
      { label: 'Proxy', value: 'TSLA' },
      { label: 'Price', value: '$392' },
    ],
    folder: 'Theses',
    createdAt: Date.now() - 1000 * 60 * 60 * 36,
    updatedAt: Date.now() - 1000 * 60 * 60 * 36,
    published: true,
    replyToId: null,
    hearts: 17,
    aiModel: 'claude-3.5-sonnet',
  },
  {
    id: 'seed-3',
    title: 'Follow-up: Infrastructure Over Narrative',
    sections: [
      {
        heading: 'The Update',
        body: 'To extend the earlier Tesla note — the builders who last are the ones indifferent to narrative cycles. They ship through bull and bear. The market eventually re-rates real infrastructure; it always has. I am adding Tesla\'s Megapack and Supercharger network to the list of under-appreciated compounders.',
      },
      {
        heading: 'The Receipt',
        body: 'No change to position size. Added a note to the thesis file: "Re-evaluate if Supercharger licensing revenue exceeds $2B annualized." Still patient. Still unbothered by the weekly tape.',
        conviction: 84,
      },
    ],
    tags: [
      { label: 'Theme', value: 'Infrastructure' },
      { label: 'Horizon', value: '5–10 yrs' },
    ],
    folder: 'Updates',
    createdAt: Date.now() - 1000 * 60 * 60 * 8,
    updatedAt: Date.now() - 1000 * 60 * 60 * 8,
    published: true,
    replyToId: 'seed-2',
    hearts: 9,
    aiModel: 'gpt-4o',
  },
];

function migrate(raw: any): any {
  if (!Array.isArray(raw)) return raw;
  return raw.map((p: any) => {
    let next = { ...p };
    // tags: string[] -> Tag[]
    if (Array.isArray(p.tags)) {
      next.tags = p.tags.map((t: any) =>
        typeof t === 'string' ? { label: 'Tag', value: t } : t
      );
    }
    // legacy single body -> sections
    if (!Array.isArray(p.sections)) {
      const body = typeof p.body === 'string' ? p.body : '';
      const paragraphs = body.split(/\n\s*\n/);
      let s1 = body;
      let s2 = '';
      if (paragraphs.length >= 2) {
        const mid = Math.ceil(paragraphs.length / 2);
        s1 = paragraphs.slice(0, mid).join('\n\n');
        s2 = paragraphs.slice(mid).join('\n\n');
      }
      next.sections = [
        { heading: 'The Thesis', body: s1 },
        { heading: 'The Receipt', body: s2 },
      ];
      delete next.body;
    }

    // Migrate a "Conviction" tag into H2 conviction score
    if (Array.isArray(next.tags) && Array.isArray(next.sections)) {
      const convIdx = next.tags.findIndex(
        (t: any) => typeof t?.label === 'string' && t.label.toLowerCase() === 'conviction'
      );
      if (convIdx >= 0) {
        const raw = String(next.tags[convIdx].value || '');
        const m = raw.match(/(\d{1,3})/);
        if (m) {
          const n = Math.max(0, Math.min(100, parseInt(m[1], 10)));
          const h2 = next.sections[1] || next.sections[0];
          if (h2 && (h2.conviction === undefined || h2.conviction === null)) {
            h2.conviction = n;
          }
        }
        next.tags = next.tags.filter((_: any, i: number) => i !== convIdx);
      }
    }

    return next;
  });
}

export function PostsProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [tagClicks, setTagClicks] = useState<Tally>({});
  const [folderClicks, setFolderClicks] = useState<Tally>({});
  const [heartedIds, setHeartedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      try {
        const raw = await persistence.getItem(POSTS_KEY);
        if (raw) {
          setPosts(migrate(JSON.parse(raw)));
        } else {
          // Try older keys for migration
          const older =
            (await persistence.getItem('tracktt.posts.v3')) ||
            (await persistence.getItem('inkwell.posts.v2')) ||
            (await persistence.getItem('inkwell.posts.v1'));
          if (older) {
            const migrated = migrate(JSON.parse(older));
            setPosts(migrated);
            await persistence.setItem(POSTS_KEY, JSON.stringify(migrated));
          } else {
            setPosts(seedPosts);
            await persistence.setItem(POSTS_KEY, JSON.stringify(seedPosts));
          }
        }
        const tc = await persistence.getItem(TAG_CLICKS_KEY);
        if (tc) setTagClicks(JSON.parse(tc));
        const fc = await persistence.getItem(FOLDER_CLICKS_KEY);
        if (fc) setFolderClicks(JSON.parse(fc));
        const h = await persistence.getItem(HEARTED_KEY);
        if (h) setHeartedIds(JSON.parse(h));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = useCallback(async (next: Post[]) => {
    setPosts(next);
    await persistence.setItem(POSTS_KEY, JSON.stringify(next));
  }, []);

  const addPost: PostsContextValue['addPost'] = async (p) => {
    const now = Date.now();
    const post: Post = {
      ...p,
      id: `p_${now}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: now,
      updatedAt: now,
      hearts: 0,
    };
    const next = [post, ...posts];
    await persist(next);
    return post;
  };

  const updatePost: PostsContextValue['updatePost'] = async (id, patch) => {
    const next = posts.map((p) =>
      p.id === id ? { ...p, ...patch, updatedAt: Date.now() } : p
    );
    await persist(next);
  };

  const deletePost: PostsContextValue['deletePost'] = async (id) => {
    await persist(posts.filter((p) => p.id !== id));
  };

  const toggleHeart: PostsContextValue['toggleHeart'] = async (id) => {
    const isHearted = !!heartedIds[id];
    const nextPosts = posts.map((p) =>
      p.id === id ? { ...p, hearts: Math.max(0, p.hearts + (isHearted ? -1 : 1)) } : p
    );
    const nextHearted = { ...heartedIds };
    if (isHearted) delete nextHearted[id];
    else nextHearted[id] = true;
    setHeartedIds(nextHearted);
    await persistence.setItem(HEARTED_KEY, JSON.stringify(nextHearted));
    await persist(nextPosts);
  };

  const recordTagClick = async (tag: string) => {
    const next = { ...tagClicks, [tag]: (tagClicks[tag] || 0) + 1 };
    setTagClicks(next);
    await persistence.setItem(TAG_CLICKS_KEY, JSON.stringify(next));
  };

  const recordFolderClick = async (folder: string) => {
    const next = { ...folderClicks, [folder]: (folderClicks[folder] || 0) + 1 };
    setFolderClicks(next);
    await persistence.setItem(FOLDER_CLICKS_KEY, JSON.stringify(next));
  };

  return (
    <PostsContext.Provider
      value={{
        posts,
        loading,
        addPost,
        updatePost,
        deletePost,
        toggleHeart,
        heartedIds,
        tagClicks,
        recordTagClick,
        folderClicks,
        recordFolderClick,
      }}
    >
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts() {
  const ctx = useContext(PostsContext);
  if (!ctx) throw new Error('usePosts must be used within PostsProvider');
  return ctx;
}

export const DEFAULT_SECTIONS: PostSection[] = [
  { heading: 'The Thesis', body: '' },
  { heading: 'The Receipt', body: '', conviction: null },
];
