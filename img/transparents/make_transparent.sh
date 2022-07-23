#!/bin/bash
#
# Usage:
#     ./make_transparent.sh bw_image.png
#
# This converts a black-and-white image to an image that is transparent
# where the input image is white and is opaque where the input image is
# black. The advantage of this script is that it avoids awkward previous-color
# or poorly-antialiased halos around opaque sections. The default opaque color
# is white; this can be changed by editing the #ffffff string, which is a hex
# rgb string. This assumes the input is a png, but can be modified to avoid that
# if needed.
#

if [ -z "$1" ]; then
    # Print out the usage string.
    tail +2 $0 | awk '{if ($0 ~ /^#/) {print} else {exit}}' | cut -c2-
    exit
fi

# Create the transparent version.
size=$(awk '{print $3}' <(identify $1))
convert -size $size xc:#ffffff solid_white.png
convert $1 -channel rgb -negate mask_$1
convert solid_white.png mask_$1 -alpha off -compose CopyOpacity -composite transparent_$1

# Clean up temporary files.
rm solid_white.png
rm mask_$1
