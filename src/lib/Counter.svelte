<script>
  import { t } from "./i18n";
  import Button from "$lib/components/common/Button.svelte";

  let count = $state(0)
</script>

<Button className="counter" unstyled on:click={() => count++}>{$t("counter.countIs", { count })}</Button>
