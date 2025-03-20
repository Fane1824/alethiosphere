export function parseQueryParams(searchParams) {
	const sortParam = searchParams.get('sort') || '';
	const sort = {};

	if (sortParam) {
		sortParam.split(',').forEach(part => {
			const [field, direction] = part.split(':');
			if (field) {
				sort[field] = direction?.toLowerCase() === 'desc' ? -1 : 1;
			}
		});
	}

	const fieldsParam = searchParams.get('fields') || '';
	const projection = {};

	if (fieldsParam) {
		fieldsParam.split(',').forEach(field => {
			if (field.trim()) {
				projection[field.trim()] = 1;
			}
		});
	}

	const filter = {};

	for (const [key, value] of searchParams.entries()) {
		// Skip the parameters we've already processed
		if (['page', 'limit', 'sort', 'fields'].includes(key)) {
			continue;
		}

		// Handle special operators
		if (key.includes('_')) {
			const [field, operator] = key.split('_');

			switch (operator) {
				case 'gt':
					filter[field] = { ...filter[field], $gt: parseValue(value) };
					break;
				case 'gte':
					filter[field] = { ...filter[field], $gte: parseValue(value) };
					break;
				case 'lt':
					filter[field] = { ...filter[field], $lt: parseValue(value) };
					break;
				case 'lte':
					filter[field] = { ...filter[field], $lte: parseValue(value) };
					break;
				case 'ne':
					filter[field] = { ...filter[field], $ne: parseValue(value) };
					break;
				case 'in':
					filter[field] = {
						...filter[field],
						$in: value.split(',').map(v => parseValue(v))
					};
					break;
				case 'nin':
					filter[field] = {
						...filter[field],
						$nin: value.split(',').map(v => parseValue(v))
					};
					break;
				case 'regex':
					filter[field] = {
						...filter[field],
						$regex: value,
						$options: searchParams.get(`${field}_options`) || 'i'
					};
					break;
			}
		} else {
			// Simple equality
			filter[key] = parseValue(value);
		}
	}

	return {
		filter,
		sort,
		projection,
		page,
		limit,
		skip
	};
}

// Helper to parse values to their appropriate type
function parseValue(value) {
	// Try to convert to number
	if (!isNaN(value) && value.trim() !== '') {
		const num = Number(value);
		if (num.toString() === value) {
			return num;
		}
	}

	// Check for boolean
	if (value === 'true') return true;
	if (value === 'false') return false;

	// Check for null
	if (value === 'null') return null;

	// Default to string
	return value;
}