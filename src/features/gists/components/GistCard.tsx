import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Gist } from '../../../types/gist';
import { useAppTheme } from '../../../app/theme/context';
import { createThemedStyles } from '../../../app/theme/tokens';
import { AppCard } from '../../../shared/ui/AppCard';
import { MaterialSymbolIcon } from '../../../components/TabIcons';

interface GistCardProps {
  gist: Gist;
  onPressGist?: (gistId: string) => void;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown update';
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function GistCardComponent({ gist, onPressGist }: GistCardProps) {
  const { theme, themeName } = useAppTheme();
  const styles = getStyles(themeName);
  const files = Object.values(gist.files);
  const primaryFile = files[0];
  const description = gist.description?.trim() || 'Untitled gist';
  const owner = gist.owner ?? gist.user;
  const ownerLogin = owner?.login ?? 'Unknown';
  const language = primaryFile?.language ?? primaryFile?.filename?.split('.').pop() ?? 'Text';
  const handlePress = React.useCallback(() => {
    onPressGist?.(gist.id);
  }, [gist.id, onPressGist]);

  return (
    <Pressable
      accessibilityRole={onPressGist ? 'button' : undefined}
      accessibilityLabel={description}
      onPress={onPressGist ? handlePress : undefined}
      style={({ pressed }) => [pressed && onPressGist ? styles.pressed : null]}
    >
      <AppCard style={styles.card}>
        {owner?.avatar_url ? (
          <Image source={{ uri: owner.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <MaterialSymbolIcon icon="account-circle-outline" size={22} />
          </View>
        )}

        <View style={styles.copy}>
          <View style={styles.titleRow}>
            <Text numberOfLines={1} style={styles.title}>
              {description}
            </Text>
            {!gist.public ? (
              <MaterialSymbolIcon color={theme.colors.textSecondary} icon="lock-rounded" size={16} />
            ) : null}
          </View>

          <Text numberOfLines={1} style={styles.meta}>
            @{ownerLogin} · Last active {formatDate(gist.updated_at)}
          </Text>

          <View style={styles.footer}>
            <View style={styles.languageDot} />
            <Text numberOfLines={1} style={styles.footerText}>
              {language}
            </Text>
            <View style={styles.footerSpacer} />
            <MaterialSymbolIcon color={theme.colors.textSecondary} icon="star-outline-rounded" size={16} />
            <Text style={styles.footerText}>{gist.comments}</Text>
            {files.length > 1 ? (
              <Text style={styles.footerText}> · {files.length} files</Text>
            ) : null}
          </View>
        </View>
      </AppCard>
    </Pressable>
  );
}

export const GistCard = React.memo(GistCardComponent);

const getStyles = createThemedStyles(theme =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.sm,
      borderLeftWidth: 0,
      borderRightWidth: 0,
      borderTopWidth: 0,
      borderRadius: 0,
      paddingHorizontal: theme.spacing.sm + 2,
      paddingVertical: theme.spacing.sm + 2,
      backgroundColor: 'transparent',
    },
    pressed: {
      opacity: 0.92,
      transform: [{ scale: 0.99 }],
    },
    avatar: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: theme.colors.surfaceMuted,
    },
    avatarFallback: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceMuted,
    },
    copy: {
      flex: 1,
      gap: 3,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    title: {
      flex: 1,
      color: theme.colors.textPrimary,
      fontSize: 15,
      lineHeight: 20,
      fontWeight: '800',
    },
    meta: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      fontWeight: '600',
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    languageDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.colors.warning,
    },
    footerText: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      fontWeight: '600',
    },
    footerSpacer: {
      flex: 1,
    },
  }),
);
