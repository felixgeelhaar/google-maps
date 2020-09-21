export interface GoogleMapOptions {
    version?: Version | number;
    callback?: string;
    libraries?: string[];
    language?: string;
    region?: string;
}

export enum Version {
    Weekly = 'weekly',
    Quarterly = 'quarterly',
}

export interface googlemaps {
    maps: typeof google.maps;
}

export class GoogleMap {
    public google?: googlemaps;

    private static callbackName = 'default_google_maps_callback';
    private static isGoogleMapMounted = false;

    private apiKey: string;

    private options?: GoogleMapOptions;
    private _language?: string;
    private _region?: string;
    private async?: boolean;
    private defer?: boolean;

    private script?: HTMLScriptElement;
    private node?: HTMLElement;
    private mapOptions?: google.maps.MapOptions;

    constructor(apiKey: string, options?: GoogleMapOptions, async?: boolean, defer?: boolean) {
        this.apiKey = apiKey;
        this.options = options;
        this.async = async;
        this.defer = defer;
    }

    public get language() {
        return this._language;
    }

    public set language(newLanguage) {
        this._language = newLanguage;
        this.unMount();
        this.mount(this.node, this.mapOptions);
    }

    public get region() {
        return this._region;
    }

    public set region(newRegion) {
        this._region = newRegion;
        this.unMount();
        this.mount(this.node, this.mapOptions);
    }

    private createURL(): string {
        // Declare base url
        let baseUrl = 'https://maps.googleapis.com/maps/api/js';
        // Google Map APIKEY
        baseUrl = `${baseUrl}?key=${this.apiKey}`;
        // Callback defines a global registered function that should be called after Google Map is loaded
        if (this.options?.callback) {
            baseUrl = `${baseUrl}&callback=${this.options.callback}`;
        } else {
            baseUrl = `${baseUrl}&callback=${GoogleMap.callbackName}`;
        }
        // Language defines the language of the Google Map and it's additional librarier
        if (this.options?.language || this.language) {
            baseUrl = `${baseUrl}&language=${this.options?.language || this.language}`;
        }
        // Region defines the region of the Google Map
        if (this.options?.region || this.region) {
            baseUrl = `${baseUrl}&region=${this.options?.region || this.region}`;
        }
        // Libraries are modules of code that provide additional functionality to the main Maps JavaScript API but are not loaded unless specifically requested
        if (this.options?.libraries) {
            baseUrl = `${baseUrl}&libraries=${this.options.libraries.join(',')}`;
        }
        // Version defines a release channel (weekly or quarterly) or a specific version
        if (this.options?.version) {
            baseUrl = `${baseUrl}&v=${this.options.version}`;
        }

        return baseUrl;
    }

    private prepareScript() {
        this.script = document.createElement('script');
        this.script.src = this.createURL();
        this.script.type = 'text/javascript';
        // async specifies that the script will be executed asynchronously as soon as it is available
        if (this.async) {
            this.script.async = this.async;
        }
        // defer specifies that the script is executed when the page has finished parsing
        if (this.defer) {
            this.script.defer = this.defer;
        }
        this.script.id = 'google-maps';

        document.head.append(this.script);
    }

    private awaitCallback(): Promise<googlemaps> {
        return new Promise<googlemaps>((resolve) => {
            if (this.options?.callback) {
                (window as any)[this.options?.callback] = () => {
                    return resolve(window['google']);
                };
            } else {
                (window as any)[GoogleMap.callbackName] = () => {
                    return resolve(window['google']);
                };
            }
        });
    }

    public async mount(node?: HTMLElement, mapOptions?: google.maps.MapOptions) {
        this.node = node;
        this.mapOptions = mapOptions;
        this.prepareScript();
        GoogleMap.isGoogleMapMounted = true;
        this.google = await this.awaitCallback();

        if (this.google && node) {
            node.setAttribute('style', 'height: 500px');
            new this.google.maps.Map(node, mapOptions);
        }
    }

    public unMount() {
        Array.from(document.head.children).forEach((element: HTMLHeadElement | HTMLScriptElement | Element) => {
            if (element instanceof HTMLScriptElement) {
                if (element.src.includes('maps.googleapis.com')) {
                    document.head.removeChild(element);
                }
            }
        });

        if (this.node) {
            this.node.innerHTML = '';
        }
        delete (window as any)['google'];
        GoogleMap.isGoogleMapMounted = false;
    }
}
