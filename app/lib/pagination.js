
export default (recordCount, pageSize, currentPage) => {
  const pageCount = Math.ceil(recordCount / pageSize);
  return {
    pageCount,
    pageSize,
    currentPage,
    recordCount,
  };
};
