
    export type RemoteKeys = 'loyalty/App';
    type PackageType<T> = T extends 'loyalty/App' ? typeof import('loyalty/App') :any;