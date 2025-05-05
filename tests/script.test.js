describe('Dummy Passing Tests', () => {
    test('placeholder test 1', () => {
        expect(true).toBe(true);
    });

    test('placeholder test 2', () => {
        expect(1 + 1).toBe(2);
    });

    test('placeholder test 3', () => {
        const sample = ['a', 'r', 'c'];
        expect(sample.includes('r')).toBe(true);
    });
});
