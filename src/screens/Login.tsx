import { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, StyleSheet, Platform } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { login, sendPasswordReset } from "../services/auth";
import { palette, spacing, borderRadius } from "../theme";
import { useGoogleAuth } from "../services/googleAuth";

// Cor principal da tela de login (azul-esverdeado)
const LOGIN_COLORS = {
  primary: '#0d9488',      // teal-600
  primaryDark: '#0f766e',  // teal-700
  primaryLight: '#14b8a6', // teal-500
  gradient: '#f0fdfa',     // teal-50
};

export default function Login({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetResult, setResetResult] = useState<string | null>(null);

  const { request, promptAsync } = useGoogleAuth();

  async function handleLogin() {
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      const code: string = err?.code || "";
      let message = err?.message || "Ocorreu um erro ao tentar entrar.";

      if (code.includes("auth/user-not-found")) {
        message = "Usuário não encontrado. Verifique seu email.";
      } else if (code.includes("auth/wrong-password")) {
        message = "Senha incorreta. Tente novamente ou recupere a senha.";
      } else if (code.includes("auth/invalid-email")) {
        message = "Email inválido. Verifique o formato do email.";
      } else if (code.includes("auth/network-request-failed")) {
        message = "Sem conexão. Verifique sua internet e tente novamente.";
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError(null);
    if (!request) return;
    setLoading(true);
    try {
      await promptAsync();
    } catch (err: any) {
      setError("Erro ao entrar com Google. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSendReset() {
    setResetResult(null);
    setResetLoading(true);
    try {
      const target = resetEmail?.trim() || email?.trim();
      if (!target) {
        setResetResult("Por favor informe o e-mail para recuperação.");
        return;
      }
      await sendPasswordReset(target);
      setResetResult("Link de recuperação enviado. Verifique sua caixa de entrada.");
      setShowReset(false);
    } catch (err: any) {
      const code: string = err?.code || "";
      let message = err?.message || "Erro ao enviar o link de recuperação.";
      if (code.includes("auth/user-not-found")) {
        message = "Usuário não encontrado. Verifique o email informado.";
      }
      setResetResult(message);
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* Header com ícone e título */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="piggy-bank" size={64} color="#fff" />
        </View>
        <Text style={styles.appName}>Cofrin</Text>
        <Text style={styles.tagline}>
          Organize suas finanças de forma{'\n'}simples como anotar num papel
        </Text>
      </View>

      {/* Card de Login */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Bem-vindo de volta!</Text>

        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="email-outline" size={20} color={palette.textMuted} style={styles.inputIcon} />
          <TextInput
            placeholder="Email"
            placeholderTextColor={palette.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
            editable={!loading}
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="lock-outline" size={20} color={palette.textMuted} style={styles.inputIcon} />
          <TextInput
            placeholder="Senha"
            placeholderTextColor={palette.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            editable={!loading}
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          onPress={handleLogin}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.buttonPressed,
            loading && styles.buttonDisabled,
          ]}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={styles.buttonContent}>
              <MaterialCommunityIcons name="login" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.primaryButtonText}>Entrar</Text>
            </View>
          )}
        </Pressable>

        <Pressable
          onPress={handleGoogleLogin}
          style={({ pressed }) => [
            styles.googleButton,
            pressed && styles.buttonPressed,
            !request && styles.buttonDisabled,
          ]}
          disabled={!request || loading}
        >
          <View style={styles.buttonContent}>
            <MaterialCommunityIcons name="google" size={20} color={palette.text} style={{ marginRight: 8 }} />
            <Text style={styles.googleButtonText}>Continuar com Google</Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => { setShowReset(!showReset); if (!showReset) setResetEmail(email); }}
          style={styles.linkContainer}
        >
          <Text style={styles.linkText}>{showReset ? "Fechar" : "Esqueceu sua senha?"}</Text>
        </Pressable>

        {showReset && (
          <View style={styles.resetContainer}>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="email-outline" size={20} color={palette.textMuted} style={styles.inputIcon} />
              <TextInput
                placeholder="Digite seu e-mail"
                placeholderTextColor={palette.textMuted}
                value={resetEmail}
                onChangeText={setResetEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
              />
            </View>
            <Pressable
              onPress={handleSendReset}
              style={({ pressed }) => [
                styles.resetButton, 
                pressed && styles.buttonPressed, 
                resetLoading && styles.buttonDisabled
              ]}
              disabled={resetLoading}
            >
              {resetLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.resetButtonText}>Enviar link de recuperação</Text>
              )}
            </Pressable>
            {resetResult && <Text style={styles.helperText}>{resetResult}</Text>}
          </View>
        )}

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou</Text>
          <View style={styles.dividerLine} />
        </View>

        <Pressable onPress={() => navigation.navigate("Crie uma conta")} style={styles.registerButton}>
          <Text style={styles.registerText}>
            Não tem conta? <Text style={styles.registerTextBold}>Criar agora</Text>
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LOGIN_COLORS.primary,
    paddingHorizontal: spacing.lg,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 32,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: spacing.sm,
  },
  tagline: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...Platform.select({
      web: {
        boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
      },
      default: {
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
    }),
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: palette.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.grayLight,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: palette.text,
  },
  primaryButton: {
    backgroundColor: LOGIN_COLORS.primary,
    paddingVertical: 14,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  googleButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: palette.border,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  googleButtonText: {
    color: palette.text,
    fontWeight: '600',
    fontSize: 15,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  linkContainer: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  linkText: {
    color: LOGIN_COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  resetContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
  resetButton: {
    backgroundColor: LOGIN_COLORS.primaryLight,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  error: {
    color: palette.danger,
    marginBottom: spacing.sm,
    textAlign: 'center',
    fontSize: 14,
  },
  helperText: {
    color: palette.textSecondary,
    fontSize: 13,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: palette.border,
  },
  dividerText: {
    paddingHorizontal: spacing.md,
    color: palette.textMuted,
    fontSize: 13,
  },
  registerButton: {
    alignItems: 'center',
  },
  registerText: {
    color: palette.textSecondary,
    fontSize: 14,
  },
  registerTextBold: {
    color: LOGIN_COLORS.primary,
    fontWeight: '700',
  },
});
