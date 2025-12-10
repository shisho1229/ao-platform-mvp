// Loohcs志塾の校舎マスターデータ

export const LOOHCS_CAMPUSES = [
  '渋谷',
  '下北沢',
  'オンライン',
  '武蔵小杉',
  '自由が丘',
  '青葉台',
  '自力合格', // 塾に通っていない場合
];

// 校舎一覧を取得
export function getCampuses(): string[] {
  return LOOHCS_CAMPUSES;
}
