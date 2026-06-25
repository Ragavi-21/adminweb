import bcrypt from 'bcryptjs';
import { query } from './db.js';

const ADMIN = { name: 'Super Admin', initials: 'SA' };

const page = (overrides) => ({
  type: 'Page',
  status: 'Published',
  metaDescription: '',
  seoTitle: '',
  createdAt: '2025-05-01T10:00:00',
  lastUpdated: '2025-05-01T10:00:00',
  ...overrides,
});

const SEED_PAGES = {
  dendo: [
    page({ title: 'Home', slug: '/', type: 'Landing', lastUpdated: '2025-05-20T10:30:00', metaDescription: 'Dendo helps you streamline your workflow, build beautiful products and grow your business.' }),
    page({ title: 'About Us', slug: '/about', type: 'Page', lastUpdated: '2025-05-19T16:15:00' }),
    page({ title: 'Services', slug: '/services', type: 'Page', lastUpdated: '2025-05-18T11:20:00' }),
    page({ title: 'Pricing', slug: '/pricing', type: 'Page', status: 'Draft', lastUpdated: '2025-05-17T14:40:00' }),
    page({ title: 'Blog', slug: '/blog', type: 'Listing', lastUpdated: '2025-05-16T09:10:00' }),
    page({ title: 'Blog Details', slug: '/blog/[id]', type: 'Single', lastUpdated: '2025-05-15T15:25:00' }),
    page({ title: 'Contact Us', slug: '/contact', type: 'Page', lastUpdated: '2025-05-14T10:05:00' }),
    page({ title: 'Terms & Conditions', slug: '/terms', type: 'Page', lastUpdated: '2025-05-10T13:15:00' }),
    page({ title: 'Privacy Policy', slug: '/privacy', type: 'Page', lastUpdated: '2025-05-09T11:45:00' }),
    page({ title: '404 Not Found', slug: '/404', type: 'System', lastUpdated: '2025-05-01T00:00:00' }),
    page({ title: 'Careers', slug: '/careers', type: 'Page', status: 'Draft', lastUpdated: '2025-04-28T09:00:00' }),
    page({ title: 'Promo Landing', slug: '/promo', type: 'Landing', status: 'Draft', lastUpdated: '2025-04-22T17:30:00' }),
  ],
  cravix: [
    page({ title: 'Home', slug: '/', type: 'Landing', lastUpdated: '2025-05-12T10:00:00' }),
    page({ title: 'About', slug: '/about', type: 'Page', lastUpdated: '2025-05-11T10:00:00' }),
    page({ title: 'Shop', slug: '/shop', type: 'Listing', lastUpdated: '2025-05-10T10:00:00' }),
    page({ title: 'Product Details', slug: '/shop/[id]', type: 'Single', lastUpdated: '2025-05-09T10:00:00' }),
    page({ title: 'Contact', slug: '/contact', type: 'Page', lastUpdated: '2025-05-08T10:00:00' }),
    page({ title: 'Privacy Policy', slug: '/privacy', type: 'Page', lastUpdated: '2025-05-07T10:00:00' }),
  ],
  'dendo-quick': [
    page({ title: 'Home', slug: '/', type: 'Landing', lastUpdated: '2025-05-12T10:00:00' }),
    page({ title: 'Features', slug: '/features', type: 'Page', lastUpdated: '2025-05-11T10:00:00' }),
    page({ title: 'Pricing', slug: '/pricing', type: 'Page', lastUpdated: '2025-05-10T10:00:00' }),
    page({ title: 'Contact', slug: '/contact', type: 'Page', lastUpdated: '2025-05-09T10:00:00' }),
  ],
  zen: [
    page({ title: 'Home', slug: '/', type: 'Landing', lastUpdated: '2025-05-12T10:00:00' }),
    page({ title: 'About', slug: '/about', type: 'Page', lastUpdated: '2025-05-11T10:00:00' }),
    page({ title: 'Programs', slug: '/programs', type: 'Listing', lastUpdated: '2025-05-10T10:00:00' }),
    page({ title: 'Contact', slug: '/contact', type: 'Page', lastUpdated: '2025-05-09T10:00:00' }),
    page({ title: 'Privacy Policy', slug: '/privacy', type: 'Page', lastUpdated: '2025-05-08T10:00:00' }),
  ],
  'nexa-ride': [
    page({ title: 'Home', slug: '/', type: 'Landing', lastUpdated: '2025-05-12T10:00:00' }),
    page({ title: 'How It Works', slug: '/how-it-works', type: 'Page', lastUpdated: '2025-05-11T10:00:00' }),
    page({ title: 'Drivers', slug: '/drivers', type: 'Page', lastUpdated: '2025-05-10T10:00:00' }),
    page({ title: 'Contact', slug: '/contact', type: 'Page', lastUpdated: '2025-05-09T10:00:00' }),
  ],
  'work-portfolio': [
    page({ title: 'Home', slug: '/', type: 'Landing', lastUpdated: '2025-05-12T10:00:00' }),
    page({ title: 'Projects', slug: '/projects', type: 'Listing', lastUpdated: '2025-05-11T10:00:00' }),
    page({ title: 'Project Details', slug: '/projects/[id]', type: 'Single', lastUpdated: '2025-05-10T10:00:00' }),
    page({ title: 'About', slug: '/about', type: 'Page', lastUpdated: '2025-05-09T10:00:00' }),
    page({ title: 'Contact', slug: '/contact', type: 'Page', lastUpdated: '2025-05-08T10:00:00' }),
  ],
};

export async function seedIfEmpty() {
  const { rows: userRows } = await query('SELECT COUNT(*) FROM admin_users');
  if (parseInt(userRows[0].count) === 0) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    await query(
      `INSERT INTO admin_users (username, password_hash, name, initials, role)
       VALUES ($1, $2, $3, $4, $5)`,
      ['admin', passwordHash, ADMIN.name, ADMIN.initials, 'Administrator']
    );
    console.log('🌱 Seeded default admin user (admin / admin123)');
  }

  const { rows: pageRows } = await query('SELECT COUNT(*) FROM pages');
  if (parseInt(pageRows[0].count) === 0) {
    for (const [siteId, pages] of Object.entries(SEED_PAGES)) {
      for (let i = 0; i < pages.length; i++) {
        const p = pages[i];
        await query(
          `INSERT INTO pages (
             site_id, title, slug, type, status, meta_description, seo_title, sort_order,
             created_by_name, created_by_initials, created_at,
             updated_by_name, updated_by_initials, last_updated
           ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
          [
            siteId, p.title, p.slug, p.type, p.status, p.metaDescription, p.seoTitle, i,
            ADMIN.name, ADMIN.initials, p.createdAt,
            ADMIN.name, ADMIN.initials, p.lastUpdated,
          ]
        );
      }
    }
    console.log('🌱 Seeded initial pages for all 6 sites');
  }
}
