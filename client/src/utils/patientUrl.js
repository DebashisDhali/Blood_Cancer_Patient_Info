const TOKEN_LENGTH = 12;

const slugify = (value = '') =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

export const getPatientShortToken = (id = '') => id.replace(/-/g, '').slice(0, TOKEN_LENGTH).toLowerCase();

export const buildPatientPath = (patient) => {
  if (!patient?.id) return '/patients';

  const nameSlug = slugify(patient.name) || 'patient';
  const cancerSlug = slugify(patient.cancer_type) || 'support';
  const token = getPatientShortToken(patient.id);

  return `/patients/${nameSlug}-${cancerSlug}-${token}`;
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TOKEN_REGEX = /-([0-9a-f]{12})$/i;

export const parsePatientRef = (patientRef = '') => {
  const ref = String(patientRef).trim().toLowerCase();

  if (!ref) return { mode: 'invalid', value: '' };
  if (UUID_REGEX.test(ref)) return { mode: 'id', value: ref };

  const tokenMatch = ref.match(TOKEN_REGEX);
  if (tokenMatch) return { mode: 'token', value: tokenMatch[1] };

  // Backward compatibility for short links like /patients/abcdef123456
  if (/^[0-9a-f]{12}$/i.test(ref)) return { mode: 'token', value: ref };

  return { mode: 'id', value: ref };
};
