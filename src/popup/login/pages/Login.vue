<template>
  <PageLayout :content-transition-name="contentTransitionName">
    <template #toolbar>
      <Toolbar/>
    </template>
    <template #content>
      <div class="grid login-container pt-3">
        <div style="grid-area: mail" class="flex flex-col">
          <div class="text-xs">Mail</div>
          <InputField v-model="mail" placeholder="Mail" class="mt-0.5" @keyup.enter="() => pwInput?.input?.focus()"/>
        </div>
        <div style="grid-area: pw" class="mt-2 flex flex-col">
          <div class="text-xs">Password</div>
          <PasswordInputField ref="pwInput" v-model="pw" placeholder="Password" class="mt-0.5" @keyup.enter="signIn({ mail, pw })"/>
        </div>

        <div style="grid-area: sign-in" class="flex items-center justify-center bg-primary-500 hover:bg-primary-700 rounded h-10 mt-5 cursor-pointer" @click="signIn({ mail, pw })">
          <a class="text-on-primary-500 hover:text-on-primary-700 pr-2">
            Sign-In
          </a>
          <FontAwesomeIcon v-if="status === 'loading'" icon="circle-notch" class="h-icon-sm animate-spin text-on-primary-500"/>
        </div>

        <div style="grid-area: forgot" class="flex items-start justify-end mt-1" @click="redirectToForgotPassword">
          <a class="text-xs text-primary-500 hover:text-primary-700 hover:underline"> Forgot Password ? </a>
        </div>

        <div v-if="status === 'error'" style="grid-area: error" class="mt-1 bg-error w-full">
          <div v-html="message"></div>
        </div>

        <Divider style="grid-area: div1" class="border-primary-100 mt-7" />

        <div style="grid-area: sign-up-desc" class="flex items-end justify-start mt-4 text-sub-text-on-surface-50">
          <div class="text-xs">Don't have an account?</div>
        </div>

        <div style="grid-area: sign-up" class="flex items-center justify-center bg-primary-500 hover:bg-primary-700 rounded h-10 mt-0.5 cursor-pointer" @click="redirectToSignUp">
          <a class="text-on-primary-500 hover:text-on-primary-700"> Sign-Up </a>
        </div>
      </div>
    </template>
  </PageLayout>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, watch } from 'vue';
import PageLayout from '@/foundation/components/PageLayout.vue';
import { useInjectStore } from '@/useInjectStore';
import { close } from '@/Toolbar/close';
import InputField from '@/foundation/components/InputField.vue';
import PasswordInputField from '@/components/PasswordInputField.vue';
import Divider from '@/foundation/components/Divider.vue';
import Toolbar from '@/Toolbar/Toolbar.vue';
import FontAwesomeIcon from '@/foundation/components/FontAwesomeIcon/FontAwesomeIcon.vue';

export default defineComponent({
  components: {
    PageLayout,
    InputField,
    PasswordInputField,
    Divider,
    Toolbar,
    FontAwesomeIcon
  },
  props: {
    contentTransitionName: {
      type: String as PropType<string>,
      required: false,
      default: ''
    }
  },
  setup() {
    const loginStore = useInjectStore('loginStore');
    const navigationStore = useInjectStore('navigationStore');
    const loginResponse = ref({ status: 'none', message: '' });
    const status = computed(() => loginResponse.value.status);
    watch(status, (status) => {
      if (status === 'success') {
        navigationStore.actions.toHome();
      }
    });
    const pwInput =  ref(null);

    return {
      mail: ref(''),
      pw: ref(''),
      pwInput,
      message: computed(() => loginResponse.value.message),
      signIn: async ({ mail, pw }) => {
        if (loginResponse.value.status === 'loading') {
          return;
        }
        loginResponse.value = { status: 'loading', message: '' };
        loginResponse.value = await loginStore.actions.signIn({ mail, pw });
      },
      status,
      redirectToForgotPassword: () => window.open('https://vegud.com/login/', '_blank')?.focus(),
      redirectToSignUp: () => window.open('https://vegud.com/sign-up/', '_blank')?.focus(),
      close
    };
  }
});
</script>

<style>
.login-container {
  grid-template-areas:
    '.       mail         mail    mail    .'
    '.       pw           pw      pw      .'
    '.       error        error   error   .'
    '.       sign-in      sign-in sign-in .'
    '.       .            forgot  forgot  .'
    'div1    div1         div1    div1    div1'
    '.       sign-up-desc .       .       .'
    '.       sign-up      sign-up sign-up .';
  grid-template-columns: 12px auto auto auto 12px;
}
</style>