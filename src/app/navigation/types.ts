import type {
  CompositeNavigationProp,
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import type {BottomTabNavigationProp, BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

export type RootStackParamList = {
  Auth: undefined;
  Loading: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  Settings: undefined;
  GistDetail: {gistId: string};
  GistEditor: GistEditorCreateParams | GistEditorEditParams;
  GistViewer: {
    gistId: string;
    filename: string;
    content?: string;
    gistUrl?: string;
    rawUrl: string;
    truncated?: boolean;
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

export type GistEditorDraftFile = {
  filename: string;
  content: string;
};

export type GistEditorCreateParams = {
  mode: 'create';
  description?: string;
  isPublic?: boolean;
  files?: GistEditorDraftFile[];
};

export type GistEditorEditParams = {
  mode: 'edit';
  gistId: string;
  description?: string;
  isPublic?: boolean;
  files?: GistEditorDraftFile[];
};

export type RootStackScreenProps<RouteName extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, RouteName>;

export type RootStackNavigationProp<
  RouteName extends keyof RootStackParamList = keyof RootStackParamList,
> = NativeStackNavigationProp<RootStackParamList, RouteName>;

export type MainTabScreenProps<RouteName extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, RouteName>,
  NativeStackScreenProps<RootStackParamList>
>;

export type MainTabNavigationProp<
  RouteName extends keyof MainTabParamList = keyof MainTabParamList,
> = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, RouteName>,
  NativeStackNavigationProp<RootStackParamList>
>;
