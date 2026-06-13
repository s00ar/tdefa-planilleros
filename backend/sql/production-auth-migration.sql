ALTER DATABASE `YOUR_DB_NAME` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `planilleros`
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `planilleros`
  ADD COLUMN IF NOT EXISTS `role` ENUM('admin', 'planillero') NOT NULL DEFAULT 'planillero' AFTER `status`;

ALTER TABLE `planilleros`
  ADD COLUMN IF NOT EXISTS `password` VARCHAR(255) NOT NULL DEFAULT '' AFTER `role`;

UPDATE `planilleros`
SET `role` = COALESCE(NULLIF(`role`, ''), 'planillero');

UPDATE `planilleros`
SET `password` = `username`
WHERE `password` IS NULL OR `password` = '';

INSERT INTO `planilleros` (
  `id`,
  `name`,
  `username`,
  `email`,
  `phone`,
  `dni`,
  `status`,
  `role`,
  `password`,
  `assigned_matches_count`,
  `completed_matches_count`,
  `created_at_iso`
)
SELECT
  'u_admin_1',
  'Administrador',
  'admin',
  'admin@tdefa.local',
  NULL,
  NULL,
  'activo',
  'admin',
  'admin',
  0,
  0,
  '2025-01-01'
WHERE NOT EXISTS (
  SELECT 1
  FROM `planilleros`
  WHERE `username` = 'admin'
);
