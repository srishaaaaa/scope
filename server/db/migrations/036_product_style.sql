-- A product's style within its category (e.g. a shirt: Flannel, Embroidery, Printed, Denim, Plain, Checks, Micro checks).
-- The shop shows these as a second row of choices once a category is picked.
ALTER TABLE products ADD COLUMN IF NOT EXISTS style TEXT;
CREATE INDEX IF NOT EXISTS products_style_idx ON products (style) WHERE style IS NOT NULL;
