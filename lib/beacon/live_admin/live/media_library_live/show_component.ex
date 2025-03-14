defmodule Beacon.LiveAdmin.MediaLibraryLive.ShowComponent do
  @moduledoc false

  use Beacon.LiveAdmin.Web, :live_component
  alias Beacon.LiveAdmin.Client.MediaLibrary

  @impl true
  def update(assigns, socket) do
    asset = assigns.asset
    site = asset.site

    socket =
      socket
      |> assign(assigns)
      |> assign(:is_image?, MediaLibrary.is_image?(site, asset))
      |> assign(:urls, urls_for(site, asset))

    {:ok, socket}
  end

  defp urls_for(site, asset) do
    urls =
      site
      |> MediaLibrary.urls_for(asset)
      |> Enum.with_index(1)

    [{{"name", asset.file_name}, 0} | urls]
  end

  @impl true
  def render(assigns) do
    ~H"""
    <div>
      <Beacon.LiveAdmin.Components.image_set :if={@is_image?} site={@asset.site} env={__ENV__} asset={@asset} class="mb-8" />
      <ul>
        <%= for {{key, url}, index} <- @urls do %>
          <li class="flex m-8">
            <div class="w-full">
              <label class="block text-sm font-semibold leading-6 text-zinc-800 capitalize">
                <%= key %>
              </label>
              <input type="text" id={"url-#{index}"} value={url} readonly class="flex mt-2 w-full rounded-lg text-zinc-900 focus:ring-0 sm:text-sm sm:leading-6" />
            </div>
            <div class="flex">
              <button phx-click={JS.dispatch("beacon_admin:clipcopy", to: "#url-#{index}")}>
                <.icon name="hero-clipboard-document-check-solid" class="h-5 w-5" />
              </button>
            </div>
            <div
              id={"url-#{index}-copy-to-clipboard-result"}
              class="absolute right-0 -top-10 whitespace-nowrap text-green-500 text-sm font-medium p-3 shadow-md rounded-lg bg-white transition-all duration-300 opacity-0 invisible"
              phx-update="ignore"
            >
              Copied to clipboard
            </div>
          </li>
        <% end %>
      </ul>
    </div>
    """
  end
end
