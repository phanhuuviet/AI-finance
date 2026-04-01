<script>
  import { t } from "./i18n";

  let count = $state(0)
</script>

<button class="counter" onclick={() => count++}>{$t("counter.countIs", { count })}</button>
