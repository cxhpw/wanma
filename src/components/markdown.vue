<script setup lang="ts">
import { computed } from "vue";
// @ts-ignore
import md from "../services/markdownRender";
const { content } = defineProps<{
  content: string;
}>();
const _content = computed(() => {
  return md.render(content);
});
</script>

<template>
  <div :class="$style.markdown" v-html="_content"></div>
</template>

<style lang="scss" module>
table {
  border-spacing: 0;
  border-collapse: collapse;
  width: max-content;
  max-width: 100%;
  overflow: auto;
  width: 100%;
}

th,
td {
  padding: 6px 13px;
  border: 1px solid #d0d7de;
  font-weight: 600;
}

thead tr {
  text-align: left;
  background-color: rgb(15, 23, 42, 1);
}

.markdown {
  p {
    margin-bottom: 10px;
  }
  table {
    margin-bottom: 10px;
  }
  li {
    margin-bottom: 10px;
  }
  a {
    text-decoration: underline;
  }
}
</style>
