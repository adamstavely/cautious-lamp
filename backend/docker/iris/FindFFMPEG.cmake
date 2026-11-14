# IRIS expects the FindFFMPEG module that vcpkg's ffmpeg port provides. This
# one finds the distribution's FFmpeg through pkg-config instead, setting the
# same FFMPEG_FOUND, FFMPEG_INCLUDE_DIRS and FFMPEG_LIBRARIES variables.
find_package(PkgConfig REQUIRED)
pkg_check_modules(FFMPEG_PC REQUIRED IMPORTED_TARGET libavformat libavcodec libavutil libswscale)

set(FFMPEG_INCLUDE_DIRS ${FFMPEG_PC_INCLUDE_DIRS})
set(FFMPEG_LIBRARIES PkgConfig::FFMPEG_PC)

include(FindPackageHandleStandardArgs)
find_package_handle_standard_args(FFMPEG DEFAULT_MSG FFMPEG_LIBRARIES)
