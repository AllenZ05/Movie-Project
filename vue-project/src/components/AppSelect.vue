<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, useId, watch } from "vue";
import Icon from "./Icon.vue";

const props = defineProps({
  modelValue: { type: [String, Number], default: "" },
  options: { type: Array, required: true },
  label: { type: String, required: true },
  disabled: Boolean,
});
const emit = defineEmits(["update:modelValue"]);
const id = useId();
const root = ref(null);
const trigger = ref(null);
const list = ref(null);
const open = ref(false);
const active = ref(0);
const above = ref(false);
const maxHeight = ref(320);
const selectedIndex = computed(() => props.options.findIndex((option) => option.value === props.modelValue));
const selected = computed(() => props.options[selectedIndex.value]?.label || "Choose an option");
let typed = "";
let typeTimer;

const close = () => {
  open.value = false;
  typed = "";
  clearTimeout(typeTimer);
};
const position = () => {
  if (!open.value || !trigger.value) return;
  const rect = trigger.value.getBoundingClientRect();
  const below = window.innerHeight - rect.bottom - 20;
  const over = rect.top - 20;
  above.value = below < Math.min(320, props.options.length * 44 + 12) && over > below;
  maxHeight.value = Math.max(44, Math.min(320, above.value ? over : below));
};
const revealActive = async () => {
  await nextTick();
  const option = list.value?.children[active.value];
  if (!option) return;
  const top = option.offsetTop;
  const bottom = top + option.offsetHeight;
  if (top < list.value.scrollTop) list.value.scrollTop = top;
  else if (bottom > list.value.scrollTop + list.value.clientHeight)
    list.value.scrollTop = bottom - list.value.clientHeight;
};
const show = () => {
  if (props.disabled || trigger.value?.matches(":disabled") || !props.options.length) return;
  active.value = Math.max(0, selectedIndex.value);
  open.value = true;
  position();
  revealActive();
};
const choose = (index = active.value) => {
  if (!props.options[index] || props.disabled) return close();
  emit("update:modelValue", props.options[index].value);
  close();
  trigger.value?.focus({ preventScroll: true });
};
const onKeydown = (event) => {
  if (props.disabled) return;
  const key = event.key;
  if (key === "Escape" && open.value) {
    event.preventDefault();
    event.stopPropagation();
    close();
  } else if (key === "Tab") {
    if (open.value) choose();
  } else if (["Enter", " "].includes(key)) {
    event.preventDefault();
    if (open.value) choose();
    else show();
  } else if (["ArrowDown", "ArrowUp", "Home", "End"].includes(key)) {
    event.preventDefault();
    const wasOpen = open.value;
    if (!wasOpen) show();
    if (key === "Home") active.value = 0;
    else if (key === "End") active.value = props.options.length - 1;
    else if (wasOpen)
      active.value = Math.max(
        0,
        Math.min(props.options.length - 1, active.value + (key === "ArrowDown" ? 1 : -1))
      );
    revealActive();
  } else if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
    event.preventDefault();
    if (!open.value) show();
    clearTimeout(typeTimer);
    typed += key.toLocaleLowerCase();
    const term = [...typed].every((char) => char === typed[0]) ? typed[0] : typed;
    const start = term.length === 1 ? active.value + 1 : active.value;
    for (let offset = 0; offset < props.options.length; offset++) {
      const index = (start + offset) % props.options.length;
      if (props.options[index].label.toLocaleLowerCase().startsWith(term)) {
        active.value = index;
        revealActive();
        break;
      }
    }
    typeTimer = setTimeout(() => {
      typed = "";
    }, 700);
  }
};
const outside = (event) => {
  if (!root.value?.contains(event.target)) close();
};
watch(
  () => props.disabled,
  (disabled) => {
    if (disabled) close();
  }
);
watch(
  () => props.modelValue,
  () => {
    active.value = Math.max(0, selectedIndex.value);
  }
);
watch(
  () => props.options,
  () => {
    if (open.value) close();
  }
);
onMounted(() => {
  document.addEventListener("pointerdown", outside);
  window.addEventListener("resize", position);
  window.addEventListener("scroll", position, true);
});
onUnmounted(() => {
  clearTimeout(typeTimer);
  document.removeEventListener("pointerdown", outside);
  window.removeEventListener("resize", position);
  window.removeEventListener("scroll", position, true);
});
</script>

<template>
  <div ref="root" class="app-select" :class="{ 'is-open': open }">
    <button
      ref="trigger"
      type="button"
      class="select-trigger"
      role="combobox"
      :aria-label="label"
      aria-haspopup="listbox"
      :aria-expanded="open"
      :aria-controls="`${id}-options`"
      :aria-activedescendant="open ? `${id}-option-${active}` : undefined"
      :disabled="disabled"
      @click="open ? close() : show()"
      @keydown="onKeydown"
      @blur="close"
    >
      <span class="select-value">{{ selected }}</span>
      <Icon class="select-chevron" name="down" :size="16" />
    </button>
    <ul
      v-if="open"
      :id="`${id}-options`"
      ref="list"
      class="select-options"
      :class="{ above }"
      :style="{ maxHeight: `${maxHeight}px` }"
      role="listbox"
      :aria-label="label"
    >
      <li
        v-for="(option, index) in options"
        :id="`${id}-option-${index}`"
        :key="option.value"
        role="option"
        :aria-selected="option.value === modelValue"
        :class="{ highlighted: active === index, selected: option.value === modelValue }"
        @pointermove="active = index"
        @pointerdown.prevent
        @click="choose(index)"
      >
        <span>{{ option.label }}</span>
        <Icon v-if="option.value === modelValue" name="check" :size="16" />
      </li>
    </ul>
  </div>
</template>

<style scoped>
.app-select {
  position: relative;
  min-width: 0;
  width: 100%;
}
.app-select.is-open {
  z-index: 30;
}
.select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  width: 100%;
  min-height: 46px;
  padding: 0.7rem 0.9rem;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-elevated);
  font-size: 0.8rem;
  text-align: left;
  transition: border-color 150ms, background 150ms;
}
.select-trigger:hover:not(:disabled),
.is-open .select-trigger {
  background: var(--surface);
  border-color: #99bbff66;
}
.select-trigger:disabled {
  cursor: not-allowed;
}
.select-value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.select-chevron {
  color: var(--text-muted);
  transition: transform 150ms;
}
.is-open .select-chevron {
  transform: rotate(180deg);
}
.select-options {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  margin: 0;
  padding: 5px;
  list-style: none;
  overflow-y: auto;
  overscroll-behavior: contain;
  touch-action: pan-y;
  scrollbar-width: thin;
  scrollbar-color: #414c60 transparent;
  border: 1px solid #ffffff24;
  border-radius: 12px;
  background: #1a202c;
  box-shadow: 0 12px 32px #0008;
}
.select-options.above {
  top: auto;
  bottom: calc(100% + 6px);
}
.select-options li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  min-height: 44px;
  padding: 0.65rem 0.7rem;
  border-radius: 7px;
  font-size: 0.8rem;
  color: var(--text-secondary);
  cursor: pointer;
}
.select-options li.highlighted {
  background: #2c374b;
  color: white;
}
.select-options li.selected {
  color: var(--accent);
}
@media (prefers-contrast: more) {
  .select-trigger,
  .select-options {
    border-color: var(--text-secondary);
  }
}
</style>
