-- =============================================================================
-- Supabase Schema Migration: Professor Jyotiprakash Mishra Research Portfolio
-- Provides normalized relational storage for profile, publications, patents,
-- books, tools, experience, and contact messages, with strict Row-Level Security.
-- =============================================================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    handle TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    roles TEXT[] NOT NULL DEFAULT '{}',
    tagline TEXT,
    summary TEXT,
    email TEXT NOT NULL,
    linkedin TEXT,
    github TEXT,
    blog TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Papers / Publications Table
CREATE TABLE IF NOT EXISTS public.papers (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    authors TEXT[] NOT NULL DEFAULT '{}',
    venue TEXT NOT NULL,
    venue_short TEXT,
    year INT NOT NULL,
    status TEXT NOT NULL DEFAULT 'published',
    doi TEXT,
    url TEXT,
    indexing TEXT,
    kind TEXT NOT NULL DEFAULT 'journal',
    thesis BOOLEAN DEFAULT FALSE,
    thesis_chapter TEXT,
    impact INT DEFAULT 1,
    glance TEXT,
    abstract TEXT,
    keywords TEXT[] DEFAULT '{}',
    results TEXT[] DEFAULT '{}',
    contributions TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Patents Table
CREATE TABLE IF NOT EXISTS public.patents (
    id TEXT PRIMARY KEY,
    num TEXT,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'published application',
    year INT,
    inventors TEXT[] DEFAULT '{}',
    jurisdiction TEXT DEFAULT 'IN',
    glance TEXT,
    abstract TEXT,
    claims TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Books Table
CREATE TABLE IF NOT EXISTS public.books (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    publisher TEXT NOT NULL,
    year INT NOT NULL,
    authors TEXT[] DEFAULT '{}',
    isbn TEXT,
    glance TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Teaching Tools Table
CREATE TABLE IF NOT EXISTS public.tools (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    glance TEXT,
    description TEXT,
    url TEXT,
    source_url TEXT,
    topics TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Experience Table
CREATE TABLE IF NOT EXISTS public.experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role TEXT NOT NULL,
    org TEXT NOT NULL,
    url TEXT,
    from_date TEXT NOT NULL,
    to_date TEXT NOT NULL,
    place TEXT,
    glance TEXT,
    points TEXT[] DEFAULT '{}',
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Education Table
CREATE TABLE IF NOT EXISTS public.education (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    degree TEXT NOT NULL,
    org TEXT NOT NULL,
    from_year TEXT NOT NULL,
    to_year TEXT NOT NULL,
    status TEXT,
    glance TEXT,
    points TEXT[] DEFAULT '{}',
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Contact Inquiries Table (Write-only for public, read-only for admin)
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- Row Level Security (RLS) Policies
-- Public can READ academic records; only service_role can INSERT/UPDATE/DELETE.
-- Public can INSERT into contact_inquiries, but cannot read submissions.
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public papers are viewable by everyone" ON public.papers FOR SELECT USING (true);
CREATE POLICY "Public patents are viewable by everyone" ON public.patents FOR SELECT USING (true);
CREATE POLICY "Public books are viewable by everyone" ON public.books FOR SELECT USING (true);
CREATE POLICY "Public tools are viewable by everyone" ON public.tools FOR SELECT USING (true);
CREATE POLICY "Public experiences are viewable by everyone" ON public.experiences FOR SELECT USING (true);
CREATE POLICY "Public education are viewable by everyone" ON public.education FOR SELECT USING (true);

-- Public Write for Contact Inquiries
CREATE POLICY "Public can submit contact messages" ON public.contact_inquiries FOR INSERT WITH CHECK (true);
