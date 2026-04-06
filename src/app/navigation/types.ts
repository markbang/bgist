import type {NavigatorScreenParams} from '@react-navigation/native';

export type RootStackParamList = {
  Auth: undefined;
  Loading: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
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
    content: string;
  };
  UserProfile: {username: string};
  GistHistory: {gistId: string};
};

export type MainTabParamList = {
  Home: undefined;
  Explore: undefined;
  Compose: undefined;
  Profile: undefined;
};
