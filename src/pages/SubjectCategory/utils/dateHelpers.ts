export function convertMonthToFilter(monthDisplay: string): string {
  const monthMap: Record<string, string> = {
    'Jan': '01',
    'Feb': '02',
    'Mar': '03',
    'Apr': '04',
    'May': '05',
    'Jun': '06',
    'Jul': '07',
    'Aug': '08',
    'Sep': '09',
    'Oct': '10',
    'Nov': '11',
    'Dec': '12'
  };

  const [monthAbbr, year] = monthDisplay.split(' ');
  const monthNum = monthMap[monthAbbr];

  return `${year}-${monthNum}`;
}

export function convertFilterToDisplay(monthFilter: string): string {
  const displayMap: Record<string, string> = {
    '01': 'Jan',
    '02': 'Feb',
    '03': 'Mar',
    '04': 'Apr',
    '05': 'May',
    '06': 'Jun',
    '07': 'Jul',
    '08': 'Aug',
    '09': 'Sep',
    '10': 'Oct',
    '11': 'Nov',
    '12': 'Dec'
  };

  const [year, month] = monthFilter.split('-');
  return `${displayMap[month]} ${year}`;
}
