import { Text, View } from 'react-native';
import { useTheme } from '@/hooks';

export default function HomeScreen() {
  const theme = useTheme();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
      }}
    >
      <Text style={{ color: theme.colors.textPrimary, fontSize: theme.typography.fontSize['2xl'] }}>
        Flika
      </Text>
      <Text style={{ color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.base }}>
        Your dating companion
      </Text>
    </View>
  );
}
