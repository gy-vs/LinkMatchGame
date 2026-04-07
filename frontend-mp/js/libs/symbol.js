if (typeof Symbol === 'undefined') {
  window.Symbol = function(description) {
    return '__symbol_' + description + '_' + Math.random().toString(36).substr(2, 9);
  };
}
