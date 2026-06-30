1. The update endpoints for the location, category, item, and stock features are inconsistent with the rest of the API. They require the resource ID to be passed in the request body rather than as a URL parameter.

2. The create, update, and delete endpoints for the location, category, item, and stock features are returning null as data. So if we want to get the the data, e.g: id. We have to make another request to get the data.
