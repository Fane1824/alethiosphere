// src/app/api/search/route.js
import {
	findDocuments,
	countDocuments
} from '@/lib/db';
import {
	successResponse,
	errorResponse,
	paginatedResponse
} from '@/lib/utils/api-response';

export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url);

		// Get search query
		const query = searchParams.get('q');
		if (!query || query.trim() === '') {
			return errorResponse('Search query is required', 400);
		}

		// Get resource to search (optional - default to all)
		const resource = searchParams.get('resource');

		// Pagination
		const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
		const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
		const skip = (page - 1) * limit;

		// Build search filter - text search
		const textSearchFilter = {
			$text: { $search: query }
		};

		// If resource is specified, search only that collection
		if (resource) {
			const total = await countDocuments(resource, textSearchFilter);

			const items = await findDocuments(resource, textSearchFilter, {
				skip,
				limit,
				sort: { score: { $meta: "textScore" } }, // Sort by text relevance
				projection: { score: { $meta: "textScore" } } // Include search score
			});

			return paginatedResponse(items, {
				total,
				page,
				limit,
				pages: Math.ceil(total / limit),
				query,
				resource
			});
		} else {
			// Search across multiple collections
			const collections = ['users', 'posts', 'comments']; // Add your searchable collections

			// Track the total across all collections
			let total = 0;
			let allResults = [];

			// Search each collection
			for (const collection of collections) {
				const count = await countDocuments(collection, textSearchFilter);
				total += count;

				if (count > 0) {
					const results = await findDocuments(collection, textSearchFilter, {
						limit: Math.min(10, count), // Limit per collection
						sort: { score: { $meta: "textScore" } },
						projection: {
							score: { $meta: "textScore" },
							// Add any collection-specific field selection
						}
					});

					// Add collection name to each result
					const augmentedResults = results.map(item => ({
						...item,
						_collection: collection
					}));

					allResults = [...allResults, ...augmentedResults];
				}
			}

			// Sort combined results by score
			allResults.sort((a, b) => b.score - a.score);

			// Apply pagination to combined results
			const paginatedResults = allResults.slice(skip, skip + limit);

			return paginatedResponse(paginatedResults, {
				total,
				page,
				limit,
				pages: Math.ceil(total / limit),
				query
			});
		}
	} catch (error) {
		console.error('Search error:', error);
		return errorResponse('Search failed', 500, error.message);
	}
}