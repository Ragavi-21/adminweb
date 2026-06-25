-- Database schema for the admin dashboard backend (auth + Pages CMS)

CREATE TABLE IF NOT EXISTS admin_users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT         NOT NULL,
  name          VARCHAR(100) NOT NULL,
  initials      VARCHAR(10)  NOT NULL,
  role          VARCHAR(50)  NOT NULL DEFAULT 'Administrator',
  created_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pages (
  id                   SERIAL PRIMARY KEY,
  site_id              VARCHAR(50)  NOT NULL,
  title                VARCHAR(255) NOT NULL,
  slug                 VARCHAR(255) NOT NULL,
  type                 VARCHAR(50)  NOT NULL DEFAULT 'Page',
  status               VARCHAR(50)  NOT NULL DEFAULT 'Published',
  meta_description     TEXT         NOT NULL DEFAULT '',
  seo_title            VARCHAR(255) NOT NULL DEFAULT '',
  sort_order           INT          NOT NULL DEFAULT 0,
  created_by_name      VARCHAR(100) NOT NULL,
  created_by_initials  VARCHAR(10)  NOT NULL,
  created_at           TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by_name      VARCHAR(100) NOT NULL,
  updated_by_initials  VARCHAR(10)  NOT NULL,
  last_updated         TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pages_site_id ON pages (site_id, sort_order);
