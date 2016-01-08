const Cycle = (array, i) => {
  i = i || 0;

  return {
    /* Next */
    next() {
      i = (i + 1 == array.length) ? 0 : (i + 1);
      return Cycle(array, i);
    },
    /* Previous */
    previous() {
      i = (i === 0) ? (array.length - 1) : (i - 1);
      return Cycle(array, i);
    },
    value: array[i],
    iterator: i
  };
};

export default Cycle;
