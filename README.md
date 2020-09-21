# Google Maps with Typescript

A small library which wraps and takes care about the Google Maps integration, mounting and unmounting with several options to configure the Google Maps Instance as also the Google Map itself. It exposes the google instance to further map markers, zones, layers and whatever use-case might be existing.

### Example

```javascript
import { GoogleMap } from '@felixgeelhaar/google-maps';

// Map Instance Options are optional
// Language and Region will cause a unmounting and mounting with the setting in place
const options = {
    version: 'weekly',
    region: 'US',
    language: 'en',
    libraries: ['places'],
};

const GoogleInstance = new GoogleMap('<your-api-key>', options);

// Map Options are optional, but needed to render the map with a specific center with a specific zoom, otherwise it will use the Google Map default
GoogleInstance.mount(document.getElementById('map'), mapOptions);
```
