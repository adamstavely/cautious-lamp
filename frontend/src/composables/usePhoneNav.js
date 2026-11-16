import { ref } from 'vue';

/** Whether the phone menu (the side nav on narrow screens) is open; the top bar opens it */
const open = ref(false);

export function usePhoneNav() {
  return open;
}
