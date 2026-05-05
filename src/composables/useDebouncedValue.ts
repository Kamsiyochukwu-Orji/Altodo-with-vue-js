import { ref, watch } from "vue";
import type { Ref } from "vue";

export function useDebouncedValue<T>(value: Ref<T>, delayMs = 400): Ref<T> {
  const debounced = ref<T>(value.value) as Ref<T>;

  watch(value, (newValue) => {
    const timeoutId = window.setTimeout(() => {
      debounced.value = newValue;
    }, delayMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  });

  return debounced;
}
