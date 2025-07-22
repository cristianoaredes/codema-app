module.exports = {
  rules: {
    // Permitir uso de 'any' temporariamente para tabelas não tipadas do Supabase
    '@typescript-eslint/no-explicit-any': 'off',
    // Permitir supressão de erros TypeScript para tabelas customizadas
    '@typescript-eslint/ban-ts-comment': 'off'
  }
};
