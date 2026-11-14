# Backend image, with EA's IRIS (photosensitivity analysis) and Chromium (URL
# accessibility scans, design extraction) built in.
#
# Build from the repository root, since the npm workspace lockfile lives there:
#   docker build -f backend/Dockerfile -t cautious-lamp-backend .
# or `docker compose up backend`.

# ---------------------------------------------------------------------------
# IRIS: the IrisApp console program, built from source against Debian's
# OpenCV and FFmpeg (instead of vcpkg, which would build OpenCV from source).
# Its shared libraries are bundled next to it, so the runtime image needs no
# OpenCV or FFmpeg packages. Both stages are Debian bookworm, so the system
# libraries match.
# ---------------------------------------------------------------------------
FROM debian:bookworm-slim AS iris

# electronicarts/IRIS main as of January 2025, pinned so builds are repeatable
ARG IRIS_COMMIT=d96978ac1107f3463b77f69a9c1b1ec5d45291a0

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      ca-certificates git build-essential cmake ninja-build pkg-config patchelf \
      libopencv-dev libavformat-dev libavcodec-dev libavutil-dev libswscale-dev \
      nlohmann-json3-dev libspdlog-dev \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /src
RUN git init iris \
 && git -C iris fetch --depth 1 https://github.com/electronicarts/IRIS.git "$IRIS_COMMIT" \
 && git -C iris checkout --quiet FETCH_HEAD

COPY backend/docker/iris/FindFFMPEG.cmake /src/cmake-modules/FindFFMPEG.cmake

# VideoAnalyser.cpp uses std::thread without including <thread>; MSVC and
# vcpkg's toolchain pull it in indirectly, Debian's GCC doesn't
RUN cmake -S iris -B build -G Ninja \
      -DCMAKE_BUILD_TYPE=Release \
      -DCMAKE_CXX_FLAGS="-include thread" \
      -DCMAKE_MODULE_PATH=/src/cmake-modules \
      -DBUILD_EXAMPLE_APP=ON \
      -DEXPORT_IRIS=OFF \
      -DBUILD_TESTS=OFF \
 && cmake --build build --target IrisApp

# IrisApp, its config and license, and every shared library it loads except
# glibc's (which the runtime image has), found through an rpath of $ORIGIN/lib
RUN mkdir -p /opt/iris/lib \
 && cp build/example/IrisApp iris/config/appsettings.json iris/LICENSE.txt iris/NOTICE.txt /opt/iris/ \
 && ldd /opt/iris/IrisApp \
    | awk '/=> \// { print $3 }' \
    | grep -vE '/(libc|libm|libdl|libpthread|librt|ld-linux[^/]*)\.so' \
    | xargs -I{} cp -L {} /opt/iris/lib/ \
 && patchelf --set-rpath '$ORIGIN/lib' /opt/iris/IrisApp

# ---------------------------------------------------------------------------
# Backend build
# ---------------------------------------------------------------------------
FROM node:22-bookworm-slim AS build
WORKDIR /app

# npm ci checks the lockfile against every workspace's package.json
COPY package.json package-lock.json ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
COPY sdk/package.json sdk/
COPY cli/package.json cli/
COPY mcp-server/package.json mcp-server/
COPY eslint-plugin-design-system/package.json eslint-plugin-design-system/
RUN npm ci --workspace backend --include-workspace-root=false --ignore-scripts

COPY backend/ backend/
RUN npm run build --workspace backend

# ---------------------------------------------------------------------------
# Runtime
# ---------------------------------------------------------------------------
FROM node:22-bookworm-slim
ENV NODE_ENV=production \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright \
    IRIS_EXECUTABLE_PATH=/opt/iris/IrisApp \
    IRIS_CONFIG_PATH=/opt/iris/appsettings.json \
    PORT=3000
WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
COPY sdk/package.json sdk/
COPY cli/package.json cli/
COPY mcp-server/package.json mcp-server/
COPY eslint-plugin-design-system/package.json eslint-plugin-design-system/
RUN npm ci --workspace backend --include-workspace-root=false --omit=dev --ignore-scripts \
 && npm cache clean --force

# Chromium and the system libraries it needs, at the version the installed Playwright expects
RUN cd backend && npx --no-install playwright install --with-deps chromium \
 && rm -rf /var/lib/apt/lists/*

COPY --from=iris /opt/iris /opt/iris
# Fail the build if IrisApp would miss a library at run time
RUN if ldd /opt/iris/IrisApp | grep -q 'not found'; then ldd /opt/iris/IrisApp; exit 1; fi
COPY --from=build /app/backend/dist backend/dist

WORKDIR /app/backend
RUN mkdir -p uploads results && chown -R node:node uploads results
USER node
EXPOSE 3000
CMD ["node", "dist/main"]
