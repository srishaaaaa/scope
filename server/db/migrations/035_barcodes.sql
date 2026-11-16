-- Barcodes (ported from the Mahalashmi POS): one registry row per barcode, pointing at a product variant, plus the
-- custom label sizes a shop adds for its own label rolls / sheets. Additive only: nothing existing is changed.
CREATE SEQUENCE IF NOT EXISTS barcode_product_seq START WITH 10000001;
CREATE SEQUENCE IF NOT EXISTS barcode_variant_seq START WITH 10000001;

CREATE TABLE IF NOT EXISTS barcode_registry (
  id              INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  barcode_value   TEXT NOT NULL,
  entity_type     TEXT NOT NULL DEFAULT 'variant' CHECK (entity_type IN ('product', 'variant')),
  product_id      INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id      INT REFERENCES product_variants(id) ON DELETE CASCADE,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_by_name TEXT NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK ((entity_type = 'product' AND variant_id IS NULL) OR (entity_type = 'variant' AND variant_id IS NOT NULL))
);
CREATE UNIQUE INDEX IF NOT EXISTS barcode_registry_value_key ON barcode_registry (upper(barcode_value));
CREATE INDEX IF NOT EXISTS barcode_registry_product_idx ON barcode_registry (product_id);
CREATE INDEX IF NOT EXISTS barcode_registry_variant_idx ON barcode_registry (variant_id) WHERE variant_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS barcode_custom_sizes (
  id                TEXT PRIMARY KEY,
  name              TEXT NOT NULL,
  labels_per_row    INT NOT NULL DEFAULT 1 CHECK (labels_per_row >= 1),
  width_mm          NUMERIC(8, 2) NOT NULL CHECK (width_mm > 0),
  height_mm         NUMERIC(8, 2) NOT NULL CHECK (height_mm > 0),
  horizontal_gap_mm NUMERIC(8, 2) NOT NULL DEFAULT 0 CHECK (horizontal_gap_mm >= 0),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
