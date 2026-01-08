
import { NPCRole } from '@/types';

// Define the available avatars based on the file structure
const AVATAR_MANIFEST = {
  // Key Decision Makers (Economic_Buyer, Technical_Buyer) -> "关键决策人"
  key_decision_makers: {
    male: [2, 4, 5, 6, 8, 9, 10, 11, 12, 13, 15, 17, 18, 19],
    female: [1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14],
  },
  // Decision Participants (Coach, Anti_Champion) -> "参与决策人"
  decision_participants: {
    male: [
      1, 2, 3, 4, 6, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 
      22, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 39, 
      41, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 
      58, 60, 61, 62, 63, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 
      76, 77, 78, 79, 81, 83
    ],
    female: [
      1, 2, 3, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 
      22, 23, 24, 25, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38
    ],
  },
  // Non-Decision Makers (Staff, Gatekeeper) -> "非决策人"
  non_decision_makers: {
    male: [1, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 15, 17, 18, 19, 20],
    female: [2, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14],
  },
};

/**
 * Selects a random avatar path based on role and gender.
 * @param role The NPC's role
 * @param gender The NPC's gender
 * @returns A path to the avatar image in the public directory
 */
export function selectAvatar(role: NPCRole, gender: 'Male' | 'Female'): string {
  const genderKey = gender.toLowerCase() as 'male' | 'female';
  let category: keyof typeof AVATAR_MANIFEST;
  let prefix: string;

  // Map roles to avatar categories and filename prefixes
  switch (role) {
    case 'Economic_Buyer':
    case 'Technical_Buyer':
      category = 'key_decision_makers';
      prefix = '关键决策人';
      break;
    case 'Coach':
    case 'Anti_Champion':
      category = 'decision_participants';
      prefix = '参与决策人';
      break;
    case 'Staff':
    case 'Gatekeeper':
    default:
      category = 'non_decision_makers';
      prefix = '非决策人';
      break;
  }

  const ids = AVATAR_MANIFEST[category][genderKey];
  
  // Fallback if list is empty (should not happen with current manifest)
  if (!ids || ids.length === 0) {
    return '/avatars/default.png'; 
  }

  const randomId = ids[Math.floor(Math.random() * ids.length)];
  const genderSuffix = gender === 'Male' ? '男' : '女';
  
  // Construct path: /avatars/参与决策人_1_男.png
  return `/avatars/${prefix}_${randomId}_${genderSuffix}.png`;
}
