import { createContext, use, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { EASE_OUT, SPRING, T } from '@/constants/tixo';

import { Icon } from './icon';
import { PressableScale } from './pressable-scale';

// Pengganti Alert.alert bawaan.

type Tone = 'default' | 'danger' | 'success';

export type DialogAction = {
  label: string;
  style?: 'default' | 'cancel' | 'destructive';
  /** Boleh async (tombol loading). */
  onPress?: () => void | Promise<void>;
};

export type DialogOptions = {
  title: string;
  message?: string;
  icon?: string;
  tone?: Tone;
  /** Default: satu tombol "Oke". */
  actions?: DialogAction[];
  /** Tutup lewat latar/back. Default true. */
  dismissable?: boolean;
};

const TONES: Record<Tone, { color: string; soft: string; icon: string }> = {
  default: { color: T.accent, soft: T.accentSoft, icon: 'info' },
  danger: { color: '#DC2626', soft: '#DC262626', icon: 'error' },
  success: { color: '#0EA472', soft: '#0EA47226', icon: 'check_circle' },
};

const OUT_MS = 160;

type DialogContextValue = { show: (options: DialogOptions) => void; hide: () => void };
const DialogContext = createContext<DialogContextValue | null>(null);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<(DialogOptions & { id: number }) | null>(null);
  const [visible, setVisible] = useState(false);
  const [busyIndex, setBusyIndex] = useState<number | null>(null);
  const counter = useRef(0);
  const progress = useSharedValue(0);

  const show = useCallback((options: DialogOptions) => {
    counter.current += 1;
    setBusyIndex(null);
    setDialog({ ...options, id: counter.current });
    setVisible(true);
  }, []);

  const hide = useCallback(() => {
    progress.set(withTiming(0, { duration: OUT_MS, easing: EASE_OUT }));
    // Tunggu animasi keluar.
    const closingId = counter.current;
    setTimeout(() => {
      if (counter.current === closingId) setVisible(false);
    }, OUT_MS);
  }, [progress]);

  useEffect(() => {
    if (visible) progress.set(withTiming(1, { duration: 220, easing: EASE_OUT }));
  }, [visible, dialog?.id, progress]);

  async function press(action: DialogAction, index: number) {
    if (busyIndex !== null) return;
    const openedId = counter.current;
    const result = action.onPress?.();
    if (result instanceof Promise) {
      setBusyIndex(index);
      try {
        await result;
      } finally {
        setBusyIndex(null);
      }
    }
    // Jangan tutup jika sudah diganti dialog baru.
    if (counter.current === openedId) hide();
  }

  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.get() }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.get(),
    transform: [{ scale: withSpring(0.92 + progress.get() * 0.08, SPRING) }],
  }));

  const tone = TONES[dialog?.tone ?? 'default'];
  const actions = dialog?.actions?.length ? dialog.actions : [{ label: 'Oke' }];
  const dismissable = (dialog?.dismissable ?? true) && busyIndex === null;

  return (
    <DialogContext value={{ show, hide }}>
      {children}
      <Modal
        visible={visible}
        transparent
        animationType="none"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={() => {
          if (dismissable) hide();
        }}>
        <View className="flex-1 items-center justify-center px-8">
          <Animated.View
            style={[{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }, backdropStyle]}
            className="bg-black/70">
            <Pressable
              className="flex-1"
              onPress={() => {
                if (dismissable) hide();
              }}
              accessibilityLabel="Tutup dialog"
            />
          </Animated.View>

          {dialog ? (
            <Animated.View
              key={dialog.id}
              style={cardStyle}
              accessibilityViewIsModal
              accessibilityRole="alert"
              className="w-full max-w-[340px] items-center rounded-[28px] border border-line bg-card px-6 pb-5 pt-7">
              <View
                style={{ backgroundColor: tone.soft }}
                className="h-14 w-14 items-center justify-center rounded-full">
                <Icon name={dialog.icon ?? tone.icon} size={28} color={tone.color} filled />
              </View>
              <Text className="mt-4 text-center text-[18px] font-extrabold tracking-tight text-fg">
                {dialog.title}
              </Text>
              {dialog.message ? (
                <Text className="mt-2 text-center text-[14px] leading-5 text-muted">{dialog.message}</Text>
              ) : null}

              <View className="mt-6 w-full flex-row gap-2.5">
                {actions.map((action, index) => {
                  const cancel = action.style === 'cancel';
                  const fill = action.style === 'destructive' ? TONES.danger.color : tone.color;
                  const busy = busyIndex === index;
                  return (
                    <PressableScale
                      key={action.label}
                      onPress={() => press(action, index)}
                      disabled={busyIndex !== null}
                      accessibilityRole="button"
                      accessibilityState={{ busy, disabled: busyIndex !== null }}
                      style={{
                        backgroundColor: cancel ? T.line : fill,
                        opacity: busyIndex !== null && !busy ? 0.5 : 1,
                      }}
                      className="h-12 flex-1 items-center justify-center rounded-2xl">
                      {busy ? (
                        <ActivityIndicator color={cancel ? T.fg : T.onAccent} />
                      ) : (
                        <Text className={`text-[15px] font-bold ${cancel ? 'text-fg' : 'text-on-accent'}`}>
                          {action.label}
                        </Text>
                      )}
                    </PressableScale>
                  );
                })}
              </View>
            </Animated.View>
          ) : null}
        </View>
      </Modal>
    </DialogContext>
  );
}

export function useDialog() {
  const ctx = use(DialogContext);
  if (!ctx) throw new Error('useDialog harus dipakai di dalam <DialogProvider>.');
  return ctx;
}
