<script>
  // Mock UI inspired by NotebookLM Studio tab
  let activeTool = "audio"; // audio | video | mindmap | report | quiz | data

  // Video export options (mock)
  let videoFormat = "explainer"; // explainer | summary
  let videoLanguage = "vi";
  let videoStyle = "auto"; // auto | custom
  let videoFocus =
    "Sử dụng các ví dụ đời thường để giải thích các khái niệm phức tạp.";
  let aspectRatio = "16:9"; // 16:9 | 3:2

  function createVideo() {
    // mock action
    alert(
      `Mock: Create video\nFormat: ${videoFormat}\nLanguage: ${videoLanguage}\nStyle: ${videoStyle}\nAspect ratio: ${aspectRatio}`
    );
  }
</script>

<div
  class="h-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
>
  <div class="px-5 py-4 border-b border-gray-200 bg-white">
    <div class="flex items-center justify-between">
      <h2 class="text-base font-semibold text-gray-900">Studio</h2>
      <div class="text-xs text-gray-500">Mock</div>
    </div>
  </div>

  <div class="p-5">
    <!-- Tools grid -->
    <div class="grid grid-cols-2 lg:grid-cols-3 gap-3">
      <button
        class={`rounded-xl border px-4 py-3 text-left transition ${activeTool === "audio" ? "border-blue-300 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}
        on:click={() => (activeTool = "audio")}
      >
        <div class="text-sm font-medium text-gray-900">
          Tổng quan bằng âm thanh
        </div>
        <div class="mt-1 text-xs text-gray-500">Mock output</div>
      </button>

      <button
        class={`rounded-xl border px-4 py-3 text-left transition ${activeTool === "video" ? "border-blue-300 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}
        on:click={() => (activeTool = "video")}
      >
        <div class="text-sm font-medium text-gray-900">
          Tổng quan bằng video
        </div>
        <div class="mt-1 text-xs text-gray-500">Xuất video (mock)</div>
      </button>

      <button
        class={`rounded-xl border px-4 py-3 text-left transition ${activeTool === "mindmap" ? "border-blue-300 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}
        on:click={() => (activeTool = "mindmap")}
      >
        <div class="text-sm font-medium text-gray-900">Bản đồ tư duy</div>
        <div class="mt-1 text-xs text-gray-500">Mock output</div>
      </button>

      <button
        class={`rounded-xl border px-4 py-3 text-left transition ${activeTool === "report" ? "border-blue-300 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}
        on:click={() => (activeTool = "report")}
      >
        <div class="text-sm font-medium text-gray-900">Báo cáo</div>
        <div class="mt-1 text-xs text-gray-500">Mock output</div>
      </button>

      <button
        class={`rounded-xl border px-4 py-3 text-left transition ${activeTool === "quiz" ? "border-blue-300 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}
        on:click={() => (activeTool = "quiz")}
      >
        <div class="text-sm font-medium text-gray-900">Bài kiểm tra</div>
        <div class="mt-1 text-xs text-gray-500">Mock output</div>
      </button>

      <button
        class={`rounded-xl border px-4 py-3 text-left transition ${activeTool === "data" ? "border-blue-300 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}
        on:click={() => (activeTool = "data")}
      >
        <div class="text-sm font-medium text-gray-900">Bảng dữ liệu</div>
        <div class="mt-1 text-xs text-gray-500">Mock output</div>
      </button>
    </div>

    <!-- Tool details -->
    <div class="mt-5">
      {#if activeTool === "video"}
        <div class="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="text-sm font-semibold text-gray-900">
                Tuỳ chỉnh bản Tổng quan bằng video
              </div>
              <div class="text-xs text-gray-500 mt-1">
                Mock UI theo NotebookLM.
              </div>
            </div>
            <button
              class="rounded-lg px-3 py-1.5 text-sm border border-gray-200 bg-white hover:bg-gray-50"
              on:click={() => (activeTool = "video")}
              title="Close"
            >
              ✕
            </button>
          </div>

          <div class="mt-4 space-y-3">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div class="rounded-xl border border-gray-200 bg-white p-4">
                <div class="text-sm font-medium text-gray-900">Định dạng</div>
                <div class="mt-3 space-y-2">
                  <label class="flex items-start gap-2">
                    <input
                      type="radio"
                      name="format"
                      value="explainer"
                      bind:group={videoFormat}
                    />
                    <div>
                      <div class="text-sm text-gray-900">Video giải thích</div>
                      <div class="text-xs text-gray-500">
                        Một bản tổng quan có cấu trúc và toàn diện.
                      </div>
                    </div>
                  </label>
                  <label class="flex items-start gap-2">
                    <input
                      type="radio"
                      name="format"
                      value="summary"
                      bind:group={videoFormat}
                    />
                    <div>
                      <div class="text-sm text-gray-900">Tóm tắt</div>
                      <div class="text-xs text-gray-500">
                        Một bản tổng quan ngắn gọn.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div class="rounded-xl border border-gray-200 bg-white p-4">
                <div class="text-sm font-medium text-gray-900">
                  Tuỳ chọn thêm
                </div>

                <label class="block mt-3 text-xs font-medium text-gray-600"
                  >Chọn ngôn ngữ</label
                >
                <select
                  bind:value={videoLanguage}
                  class="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                </select>

                <label class="block mt-3 text-xs font-medium text-gray-600"
                  >Chọn phong cách hình ảnh</label
                >
                <div class="mt-1 flex gap-2">
                  <button
                    class={`flex-1 rounded-lg border px-3 py-2 text-sm ${videoStyle === "auto" ? "border-blue-300 bg-blue-50 text-blue-700" : "border-gray-200 bg-white hover:bg-gray-50"}`}
                    on:click={() => (videoStyle = "auto")}
                    type="button"
                  >
                    Tự động chọn
                  </button>
                  <button
                    class={`flex-1 rounded-lg border px-3 py-2 text-sm ${videoStyle === "custom" ? "border-blue-300 bg-blue-50 text-blue-700" : "border-gray-200 bg-white hover:bg-gray-50"}`}
                    on:click={() => (videoStyle = "custom")}
                    type="button"
                  >
                    Tuỳ chỉnh
                  </button>
                </div>

                <label class="block mt-3 text-xs font-medium text-gray-600"
                  >Tỷ lệ video</label
                >
                <div class="mt-1 flex gap-2">
                  <button
                    class={`flex-1 rounded-lg border px-3 py-2 text-sm ${aspectRatio === "16:9" ? "border-blue-300 bg-blue-50 text-blue-700" : "border-gray-200 bg-white hover:bg-gray-50"}`}
                    on:click={() => (aspectRatio = "16:9")}
                    type="button"
                  >
                    16:9
                  </button>
                  <button
                    class={`flex-1 rounded-lg border px-3 py-2 text-sm ${aspectRatio === "3:2" ? "border-blue-300 bg-blue-50 text-blue-700" : "border-gray-200 bg-white hover:bg-gray-50"}`}
                    on:click={() => (aspectRatio = "3:2")}
                    type="button"
                  >
                    3:2
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-900"
                >Mấy chủ AI nên tập trung vào điều gì?</label
              >
              <textarea
                bind:value={videoFocus}
                class="mt-2 w-full min-h-[140px] rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
              <div class="mt-2 flex flex-wrap gap-2">
                <button
                  class="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs hover:bg-gray-50"
                  type="button">+ Đối tượng chuyên gia</button
                >
                <button
                  class="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs hover:bg-gray-50"
                  type="button">+ Dạng bài học</button
                >
                <button
                  class="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs hover:bg-gray-50"
                  type="button">+ Phong cách kể</button
                >
              </div>
            </div>

            <div class="flex justify-end">
              <button
                class="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                on:click={createVideo}
                type="button"
              >
                Tạo
              </button>
            </div>
          </div>
        </div>
      {:else}
        <div class="rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <div class="text-sm font-semibold text-gray-900">Output (mock)</div>
          <div class="mt-2 text-sm text-gray-600">
            Chọn một mục trong Studio để xem phần output. Hiện tại chỉ mock UI.
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>
