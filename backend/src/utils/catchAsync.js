module.exports = function catchAsync(fn) {
  const wrapper = (req, res, next) => {
    fn(req, res, next).catch(next);
  };
  return wrapper;
};
