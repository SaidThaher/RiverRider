declare module '@mdx-js/react' {
  import * as React from 'react';
  type ComponentType = React.ComponentType<any>;
  
  interface MDXProviderComponents {
    [key: string]: ComponentType;
  }
  
  interface MDXProviderProps {
    components: MDXProviderComponents;
    children: React.ReactNode;
  }
  
  export class MDXProvider extends React.Component<MDXProviderProps> {}
} 