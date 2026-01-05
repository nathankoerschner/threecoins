import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import { useAuth } from '@/context/AuthContext';
import { startChatStreaming, subscribeToChatResponse, generateChatId } from '@/services/ai';
import { Hexagram } from '@/types';
import { colors, typography, spacing } from '@/theme';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  status?: 'streaming' | 'complete' | 'error';
}

interface ReadingChatProps {
  primaryHexagram: Hexagram;
  relatingHexagram: Hexagram | null;
  changingLines: number[];
  question?: string;
  interpretation: string;
}

export const ReadingChat: React.FC<ReadingChatProps> = ({
  primaryHexagram,
  relatingHexagram,
  changingLines,
  question,
  interpretation,
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Cleanup subscription on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  const handleSend = () => {
    if (!inputText.trim() || !user || isLoading) return;

    Keyboard.dismiss();
    const userMessage = inputText.trim();
    setInputText('');
    setError(null);
    setIsLoading(true);

    // Add user message to chat
    const userMessageId = generateChatId();
    const newUserMessage: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: userMessage,
    };

    // Create placeholder for assistant response
    const assistantMessageId = generateChatId();
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      status: 'streaming',
    };

    setMessages(prev => [...prev, newUserMessage, assistantMessage]);

    // Build reading context
    const readingContext = {
      primaryHexagram: {
        number: primaryHexagram.number,
        englishName: primaryHexagram.englishName,
        chineseName: primaryHexagram.chineseName,
      },
      relatingHexagram: relatingHexagram ? {
        number: relatingHexagram.number,
        englishName: relatingHexagram.englishName,
        chineseName: relatingHexagram.chineseName,
      } : null,
      changingLines,
      question,
      interpretation,
    };

    // Get previous messages for context (excluding the new ones)
    const previousMessages = messages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    // Start streaming
    const chatId = startChatStreaming(
      userMessage,
      readingContext,
      previousMessages,
      user.uid
    );

    // Subscribe to response
    unsubscribeRef.current = subscribeToChatResponse(
      user.uid,
      chatId,
      (content, status) => {
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantMessageId
              ? { ...m, content, status: status as 'streaming' | 'complete' }
              : m
          )
        );

        if (status === 'complete') {
          setIsLoading(false);
          if (unsubscribeRef.current) {
            unsubscribeRef.current();
            unsubscribeRef.current = null;
          }
        }
      },
      (errorMessage) => {
        setIsLoading(false);
        if (errorMessage.includes('Insufficient credits')) {
          setError('You need credits to continue chatting.');
        } else {
          setError('Failed to send message. Please try again.');
        }
        // Remove the failed assistant message
        setMessages(prev => prev.filter(m => m.id !== assistantMessageId));
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }
      }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ask a Follow-up</Text>

      {/* Messages as individual cards */}
      {messages.map((message) => (
        <View
          key={message.id}
          style={message.role === 'user' ? styles.userCard : styles.assistantCard}
        >
          {message.role === 'user' ? (
            <Text style={styles.userText}>{message.content}</Text>
          ) : (
            <>
              {message.content ? (
                <Markdown style={markdownStyles}>{message.content}</Markdown>
              ) : (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.accent.primary} />
                </View>
              )}
              {message.status === 'streaming' && message.content && (
                <View style={styles.streamingIndicator}>
                  <Text style={styles.streamingDot}>●</Text>
                </View>
              )}
            </>
          )}
        </View>
      ))}

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask about your reading..."
          placeholderTextColor={colors.text.muted}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
          editable={!isLoading}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!inputText.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.background.primary} />
          ) : (
            <Text style={styles.sendButtonText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Credit Notice */}
      <Text style={styles.creditNotice}>1 credit per message</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.display,
    fontWeight: typography.fontWeight.bold,
    color: colors.accent.primary,
    marginBottom: spacing.base,
    letterSpacing: typography.letterSpacing.wide,
    ...typography.textShadow.gold,
  },
  // User message card - gold background, right-aligned like iMessage
  userCard: {
    alignSelf: 'flex-end',
    maxWidth: '85%',
    backgroundColor: colors.accent.primary,
    padding: spacing.md,
    borderRadius: 14,
    marginBottom: spacing.lg,
    // Gold glow shadow
    shadowColor: colors.accent.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    // Refined border
    borderWidth: 1,
    borderColor: colors.accent.light,
  },
  // Assistant message card - matches interpretation style
  assistantCard: {
    backgroundColor: colors.background.tertiary,
    padding: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.accent.subtle,
    marginBottom: spacing.lg,
    // Premium shadow for depth
    shadowColor: colors.shadow.sm,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  userText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.text,
    color: colors.background.primary,
    lineHeight: typography.fontSize.md * 1.5,
  },
  loadingContainer: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  streamingIndicator: {
    marginTop: spacing.sm,
    alignItems: 'flex-start',
  },
  streamingDot: {
    fontSize: typography.fontSize.xl,
    color: colors.accent.light,
    opacity: 0.8,
    // Subtle glow on streaming indicator
    textShadowColor: colors.accent.glow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    backgroundColor: colors.background.tertiary,
    borderRadius: 14,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.text,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.accent.subtle,
  },
  sendButton: {
    backgroundColor: colors.accent.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
    height: 48,
  },
  sendButtonDisabled: {
    backgroundColor: colors.state.disabled,
  },
  sendButtonText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.display,
    fontWeight: typography.fontWeight.semibold,
    color: colors.background.primary,
  },
  errorContainer: {
    backgroundColor: colors.background.tertiary,
    padding: spacing.md,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: colors.state.error,
    marginBottom: spacing.md,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.text,
    color: colors.state.error,
  },
  creditNotice: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.text,
    color: colors.text.muted,
    textAlign: 'center',
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
});

const markdownStyles = {
  body: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.text,
    color: colors.text.primary,
    lineHeight: typography.fontSize.md * 1.6,
  },
  paragraph: {
    marginBottom: spacing.sm,
  },
  strong: {
    fontWeight: typography.fontWeight.bold,
    color: colors.accent.light,
  },
};
