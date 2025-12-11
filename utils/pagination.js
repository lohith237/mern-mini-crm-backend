function buildSearchQuery(search, fields) {
  if (!search) return null;

  const regex = { $regex: search, $options: 'i' };
  return {
    $or: fields.map(field => ({ [field]: regex }))
  };
}

async function paginateAndSearch(model, {
  page = 1,
  pageSize = 10,
  search = '',
  searchFields = [],
  filter = {},
  sort = { _id: -1 },
  baseUrl = '',
  originalQuery = {},
  populate=[]
}) {
  const searchQuery = buildSearchQuery(search, searchFields);
  const finalQuery = searchQuery ? { ...filter, ...searchQuery } : filter;
  const total = await model.countDocuments(finalQuery);
  const totalPages = Math.ceil(total / pageSize);
  let query = model.find(finalQuery)
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .sort(sort);
  if (populate && populate.length > 0) {
    if (Array.isArray(populate)) {
      populate.forEach((field) => {
        query = query.populate(field);
      });
    } else {
      query = query.populate(populate);
    }
  }
  const results = await query;

  function buildUrl(pageNum) {
    const queryParams = { ...originalQuery, page: pageNum, page_size: pageSize };
    const queryString = new URLSearchParams(queryParams).toString();
    return `${baseUrl}?${queryString}`;
  }

  const next = page < totalPages ? buildUrl(page + 1) : null;
  const previous = page > 1 ? buildUrl(page - 1) : null;

  return {
    total,
    totalPages,
    page,
    pageSize,
    next,
    previous,
    results
  };
}

module.exports = { paginateAndSearch };
