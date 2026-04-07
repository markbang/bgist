export type RootStackParamList = {
  Auth: undefined;
  MainTabs: undefined;
  GistDetail: {gistId: string};
  GistEditor: {
    gistId?: string;
    files?: Record<string, {content: string; filename: string}>;
    description?: string;
    isPublic?: boolean;
    mode?: 'create' | 'edit';
  };
  GistViewer: {
    gistId: string;
    filename: string;
    content?: string;
    renderedHtml?: string;
  };
  UserProfile: {username: string};
  GistHistory: {gistId: string};
};

export type MainTabParamList = {
  MyGists: undefined;
  Explore: undefined;
  CreateGist: undefined;
  Starred: undefined;
  Profile: undefined;
};
