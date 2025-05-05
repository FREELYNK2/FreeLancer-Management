// Test suite for highlightSearchTerms function
describe('highlightSearchTerms', () => {
  it('should return original text when no search term is provided', () => {
    const result = highlightSearchTerms('Sample text', '');
    expect(result).toBe('Sample text');
  });

  it('should highlight single match in text', () => {
    const result = highlightSearchTerms('Sample text with match', 'match');
    expect(result).toBe('Sample text with <mark class="highlight">match</mark>');
  });

  it('should highlight multiple matches in text', () => {
    const result = highlightSearchTerms('Match here and match there', 'match');
    expect(result).toBe('<mark class="highlight">Match</mark> here and <mark class="highlight">match</mark> there');
  });

  it('should handle special regex characters in search term', () => {
    const result = highlightSearchTerms('Text with (special) chars', '(special)');
    expect(result).toBe('Text with <mark class="highlight">(special)</mark> chars');
  });
});

// Test suite for filterBudget function
describe('filterBudget', () => {
  it('should return true when no filter is applied', () => {
    const result = filterBudget('ZAR 500', '');
    expect(result).toBe(true);
  });

  it('should match budget in 0-1000 range', () => {
    expect(filterBudget('ZAR 500', '0-1000')).toBe(true);
    expect(filterBudget('ZAR 1000', '0-1000')).toBe(true);
    expect(filterBudget('ZAR 1001', '0-1000')).toBe(false);
  });

  it('should match budget in 1000-5000 range', () => {
    expect(filterBudget('ZAR 1001', '1000-5000')).toBe(true);
    expect(filterBudget('ZAR 3000', '1000-5000')).toBe(true);
    expect(filterBudget('ZAR 5000', '1000-5000')).toBe(true);
    expect(filterBudget('ZAR 999', '1000-5000')).toBe(false);
  });

  it('should match budget in 5000+ range', () => {
    expect(filterBudget('ZAR 5001', '5000+')).toBe(true);
    expect(filterBudget('ZAR 10000', '5000+')).toBe(true);
    expect(filterBudget('ZAR 4999', '5000+')).toBe(false);
  });
});

// Test suite for filterDuration function
describe('filterDuration', () => {
  it('should return true when no filter is applied', () => {
    const result = filterDuration('5 days', '');
    expect(result).toBe(true);
  });

  it('should match duration in 1-7 days range', () => {
    expect(filterDuration('1 days', '1-7')).toBe(true);
    expect(filterDuration('7 days', '1-7')).toBe(true);
    expect(filterDuration('8 days', '1-7')).toBe(false);
  });

  it('should match duration in 8-30 days range', () => {
    expect(filterDuration('8 days', '8-30')).toBe(true);
    expect(filterDuration('30 days', '8-30')).toBe(true);
    expect(filterDuration('31 days', '8-30')).toBe(false);
  });

  it('should match duration in 30+ days range', () => {
    expect(filterDuration('31 days', '30+')).toBe(true);
    expect(filterDuration('100 days', '30+')).toBe(true);
    expect(filterDuration('29 days', '30+')).toBe(false);
  });
});

// Test suite for filterRate function
describe('filterRate', () => {
  it('should return true when no filter is applied', () => {
    const result = filterRate('R500/hr', '');
    expect(result).toBe(true);
  });

  it('should match rate in 0-500 range', () => {
    expect(filterRate('R500/hr', '0-500')).toBe(true);
    expect(filterRate('R100/hr', '0-500')).toBe(true);
    expect(filterRate('R501/hr', '0-500')).toBe(false);
  });

  it('should match rate in 500-1000 range', () => {
    expect(filterRate('R501/hr', '500-1000')).toBe(true);
    expect(filterRate('R1000/hr', '500-1000')).toBe(true);
    expect(filterRate('R499/hr', '500-1000')).toBe(false);
  });

  it('should match rate in 1000+ range', () => {
    expect(filterRate('R1001/hr', '1000+')).toBe(true);
    expect(filterRate('R2000/hr', '1000+')).toBe(true);
    expect(filterRate('R999/hr', '1000+')).toBe(false);
  });
});

// Test suite for filterExperience function
describe('filterExperience', () => {
  it('should return true when no filter is applied', () => {
    const result = filterExperience('5 years', '');
    expect(result).toBe(true);
  });

  it('should match experience in 1-3 years range', () => {
    expect(filterExperience('1 year', '1-3')).toBe(true);
    expect(filterExperience('2 years', '1-3')).toBe(true);
    expect(filterExperience('3 years', '1-3')).toBe(true);
    expect(filterExperience('4 years', '1-3')).toBe(false);
  });

  it('should match experience in 4-7 years range', () => {
    expect(filterExperience('4 years', '4-7')).toBe(true);
    expect(filterExperience('7 years', '4-7')).toBe(true);
    expect(filterExperience('8 years', '4-7')).toBe(false);
  });

  it('should match experience in 8+ years range', () => {
    expect(filterExperience('8 years', '8+')).toBe(true);
    expect(filterExperience('10 years', '8+')).toBe(true);
    expect(filterExperience('7 years', '8+')).toBe(false);
  });

  it('should handle invalid experience formats', () => {
    expect(filterExperience('invalid', '1-3')).toBe(false);
    expect(filterExperience('', '1-3')).toBe(false);
  });
});
