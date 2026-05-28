export const PRELOADED_PAIRS = [
  {
    id: 1,
    question: `A digital camera takes a bitmap image. The image is 2000 pixels wide by 1000 pixels high with a colour depth of 24 bits.
(a) Calculate an estimate of the file size for the image. Give your answer in megabytes. Show your working.
(b) A second image is taken in black and white. It has the same number of pixels, but the file size is smaller. Explain why.
(c)(i) Give the 8-bit binary value for the ASCII character 'b'.
(c)(ii) Complete the table for character 't': ASCII denary value and hexadecimal value.`,
    markscheme: `(a) [3] 2000*1000*24=48000000 bits; /8/1024/1024=6MB or 5.7MB
(b) [2] Only 1 bit needed per pixel; file size = 2000*1000*1 not *24
(c)(i) [1] 0110 0010
(c)(ii) [2] denary 116, hex 74`,
  },
  {
    id: 2,
    question: `Samira uses a computer to draw a logo for her hotel and saves it as a vector graphic.
(i) Describe how the logo is represented by the computer.
(ii) State two reasons why the hotel logo is saved as a vector graphic instead of a bitmapped graphic.`,
    markscheme: `(i) [3] Series of geometric shapes/objects; stored coordinates; drawing list/commands/formulae; attributes/properties e.g. colour, thickness
(ii) [2] Needs to be large for signs without pixelation; smaller file size → faster transfer/less storage`,
  },
  {
    id: 3,
    question: `Amir has created a sound file.
(a) Complete the table: definitions of Sampling and Sampling resolution.
(b)(i) Name one lossless compression technique for the sound file.
(b)(ii) Describe one lossy compression technique to reduce file size.`,
    markscheme: `(b)(i) [1] Run-length encoding, Huffman Coding, or other valid lossless method
(b)(ii) [2] Reduce sampling rate – fewer samples/sec → less data; reduce sample resolution – fewer bits/sample → less data`,
  },
  {
    id: 4,
    question: `Wei wants to compress source code to transport it to another computer. Identify the most appropriate compression technique. Justify your choice.`,
    markscheme: `[3] Lossless (1 mark); lossless does not lose any data; any lost data will make the program not work`,
  },
  {
    id: 5,
    question: `Xiaoming created a logo using bitmapped graphics software.
(a) Describe how one typical feature of bitmapped software was used.
(b) Logo is 160×160 pixels, colour depth 3 bytes per pixel. Calculate file size in KB.
(c) State one benefit of a vector graphic over a bitmap for the logo.
(d) Convert hex colour #913C8E to denary values for R, G, B.`,
    markscheme: `(a) [2] 1 mark for feature + 1 for expansion e.g. colour select, add text, resize, fill, copy
(b) [3] 160×160=25600 pixels; ×3=76800 bytes; 75KB (÷1024) or 76.8KB (÷1000)
(c) [2] Enlarged without pixelation; smaller file size
(d) [2] Red=145, Green=60, Blue=142`,
  },
  {
    id: 6,
    question: `A recording of a concert is streamed after lossy compression.
(i) State why compression is needed.
(ii) Explain why lossy is more appropriate than lossless for this file.`,
    markscheme: `(i) [1] Data files very large; faster download; less bandwidth needed
(ii) [3] Lossy creates smaller file than lossless; large file needs significant reduction; loss of detail not noticed e.g. sound quality`,
  },
  {
    id: 7,
    question: `A student records a video.
(a) Describe interlaced encoding.
(b) State one benefit of interlaced versus progressive encoding.
(c) Explain how temporal redundancy compresses video.
(d)(i) Describe how a computer encodes a sound track.
(d)(ii) Explain how sampling rate and resolution affect file size.`,
    markscheme: `(a) [3] Frame split into two fields (odd/even rows); fields alternate; viewer sees data from two frames simultaneously
(b) [1] Higher perceived refresh rate; lower bandwidth
(c) [2] Identifies pixels that do not change between frames; records only differences
(d)(i) [3] Amplitude measured at regular intervals; each sample stored as binary number; samples stored in order
(d)(ii) [2] More samples/sec → larger file more accurate; more bits/sample → larger file more accurate`,
  },
  {
    id: 8,
    question: `Describe progressive encoding.`,
    markscheme: `[2] Stores all scan lines for entire frame (not split into fields); complete frames displayed in sequence; rate of picture display = frame rate`,
  },
  {
    id: 9,
    question: `Xander's presentation.
(a) Match minimum bits to maximum colours (table).
(b)(i) State what 40fps means.
(b)(ii) State two differences between interlaced and progressive encoding.
(c) State the meaning of sampling rate 88.2 kHz and sampling resolution 32 bits.`,
    markscheme: `(a) [1 per link] 1→1bit, 2→1bit, 3-4→2bits, 5-8→3bits, 9-16→4bits, 17-32→5bits, 33-64→6bits, 65-128→7bits, 129-256→8bits
(b)(i) [1] 40 images/frames displayed/recorded per second
(b)(ii) [4] Progressive: complete image per frame; not divided into fields; frames in sequence. Interlaced: divided into two fields odd/even; two frames simultaneously; field rate twice frame rate
(c) [2] 88.2kHz: sampled 88200 times per second; 32 bits: each sample stored as 32-bit binary number`,
  },
  {
    id: 10,
    question: `(a) State number of colours for 8-bit depth; convert 0100 1110 to denary.
(b) Convert -194 to 12-bit two's complement.
(c)(i) Convert BCD 0110 1001 to denary. (c)(ii) One practical use of BCD.
(d) Describe how one character is represented in a character set.
(e) Lossy or lossless for: (i) high-level language program, (ii) photo to email, (iii) video to website – justify each.`,
    markscheme: `(a)(i) [1] 256
(a)(ii) [1] 78
(b) [1] 1111 0011 1110
(c)(i) [1] 69
(c)(ii) [1] Calculator/digital clock
(d) [2] Each character has unique denary/hex/binary number
(e)(i) [2] Lossless – all data needed; program won't run if data lost
(e)(ii) [2] Lossy – colours/resolution reduced unnoticeably; email needs smaller file
(e)(iii) [2] Lossy – quality loss not noticed; faster upload/download; less bandwidth`,
  },
  {
    id: 11,
    question: `Dominic's tablet captures video.
(i) Describe how images and sound are encoded digitally.
(ii) Describe interlaced and progressive encoding.
(iii) Define temporal and spatial redundancy.`,
    markscheme: `(i) [4] Images: bitmaps of pixels, each colour unique binary, sequence of binary. Sound: amplitude at regular intervals, each → binary, sequence of samples
(ii) [4] Interlaced: split into two fields even/odd, alternating, two frames simultaneously, halves bandwidth. Progressive: entire frame at once, rate = frame rate
(iii) [2] Temporal: same pixel values same location across consecutive frames. Spatial: consecutive pixels same frame have same value`,
  },
  {
    id: 12,
    question: `Leonardo records voice.
(i) Describe how sound sampling encodes sound.
(ii) Effect of 44100 Hz versus 21000 Hz on recording and file size.
(iii) Name two sound editing software features and their purposes.`,
    markscheme: `(i) [2] Amplitude measured at regular intervals; value stored as binary
(ii) [2] Higher rate → more samples/sec → larger file, more accurate; lower rate → smaller file, less accurate
(iii) [4] e.g. Amplify (increase volume), Change pitch, Cut/delete, Copy/paste – each with description`,
  },
  {
    id: 13,
    question: `A logo is stored as a bitmap image.
(a) Describe what a bitmap image is.
(b)(i) Explain how a computer stores a black and white bitmap.
(b)(ii) Explain how RLE compresses it.
(c) Logo 500×1000 pixels, 35 colours. Estimate file size in KB.
(d) State two benefits of vector graphic versus bitmap, with reasons.`,
    markscheme: `(a) [2] Made of pixels; each pixel one colour; colour stored as binary
(b)(i) [2] 1 bit per pixel (0/1); bits stored in sequence
(b)(ii) [2] Stores colour and number of times it occurs e.g. B5 W1
(c) [4] 500×1000=500000 pixels; 35 colours→6bits/pixel; 500000×6/8=375000 bytes=375KB
(d) [4] Resize without pixelation – image redrawn; smaller file size – stores points/equations not pixels`,
  },
  {
    id: 14,
    question: `A student recorded a sound track.
(a) Explain how an analogue sound wave is sampled to produce a digital sound file.
(c) Explain the effect of changing sampling rate from 44.1 kHz to 22.05 kHz.
(d) Describe two features of sound editing software and their purpose.`,
    markscheme: `(a) [3] Amplitude measured at regular intervals; value recorded as binary number
(c) [3] Fewer samples per sec → file size decreases; larger gaps → less accurate sound
(d) [4] e.g. Fading (change volume), Removing sound (delete sections), Copy (repeat elements) – each with description`,
  },
  {
    id: 15,
    question: `Register H = 11000001.
(i) Convert as unsigned binary to denary.
(ii) Convert to hexadecimal.
(iii) Convert as two's complement to denary.
(iv) Explain why H does not contain a valid BCD value.`,
    markscheme: `(i) [1] 193
(ii) [1] C1
(iii) [1] -63
(iv) [1] First nibble 1100 = 12 which is greater than 9, invalid BCD digit`,
  },
  {
    id: 16,
    question: `A black and white bitmap image is shown.
(a) State minimum bits per pixel.
(b) Apply RLE encoding using colour codes 1=black, 3=white.
(c) State minimum bits per pixel for 30 different colours.
(d) State purpose of file header and give two examples of data it contains.
(e) Describe three graphics software features and their effects.`,
    markscheme: `(a) [1] 1
(b) [3] Correct RLE encoding e.g. 3B9 1A3 3B3 etc with correct colour/count groupings
(c) [1] 5
(d) [3] Purpose: stores metadata. Examples: file type, file size, image dimensions, colour depth, compression type
(e) [6] e.g. Resize, Crop (remove part), Blur, Red eye reduction – each named + effect`,
  },
  {
    id: 17,
    question: `A student is creating a video with background music.
(a) Explain how a microphone captures music.
(b) Explain how sampling resolution affects the sound file.
(c) Describe two sound editing software features.
(d)(i) What does 60 fps mean?
(d)(ii) Describe progressive encoding.
(e) What is a multimedia container format?`,
    markscheme: `(a) [3] Diaphragm vibrates with sound waves; coil moves past magnet; electric current generated
(b) [3] Sampling resolution = bits per sample; higher → larger file, more accurate; lower → smaller, less accurate
(c) [4] e.g. Cut/delete, Copy/paste, Amplify – each with purpose
(d)(i) [1] 60 images recorded per second
(d)(ii) [2] Each frame contains complete image; all frame data recorded at same time; images = frame rate
(e) [1] A meta-file/wrapper containing various data types (video, audio, subtitles)`,
  },
  {
    id: 18,
    question: `Register X = 10111010.
(i) Convert as unsigned binary to denary.
(ii) Convert to hexadecimal.
(iii) Convert as two's complement to denary.`,
    markscheme: `(i) [1] 186
(ii) [1] BA
(iii) [1] -70`,
  },
  {
    id: 19,
    question: `A company website uses images.
(a) A 4-colour bitmap image has a 6×6 pixel grid. (i) Minimum bits per pixel. (ii) Minimum file size.
(b) Photograph 1000×1000 pixels, 2 bytes per pixel. (i) Estimate file size in MB. (ii) Link methods to descriptions and compression types.
(c) Two reasons why a vector graphic is sensible for the company logo.`,
    markscheme: `(a)(i) [1] 2
(a)(ii) [3] 36 pixels × 2 bits = 72 bits = 9 bytes
(b)(i) [4] 1,000,000 × 2 = 2,000,000 bytes = 2MB (or 1.91MB)
(b)(ii) [5] Cropping (lossy), Reducing resolution (lossy), RLE (lossless), Reducing colour depth (lossy) – correctly linked
(c) [4] Smaller file size → faster transfer; enlarges without pixelation → usable on different screens`,
  },
  {
    id: 20,
    question: `Register X = 11000001.
(i) Convert as unsigned binary to denary.
(ii) Convert to hexadecimal.
(iii) Convert as two's complement to denary.`,
    markscheme: `(i) [1] 193
(ii) [1] C1
(iii) [1] -63`,
  },
  {
    id: 21,
    question: `A product designer creates a poster.
(a) A 6-colour bitmap has a 6×6 pixel grid. (i) Minimum bits per pixel. (ii) Minimum file size.
(b)(i) Photograph 50000×50000 pixels, 4 bytes per pixel. Calculate file size in GB.
(b)(ii) Tick lossy/lossless for: cropping, reducing resolution, RLE, reducing colour depth.
(c) Explain how RLE compresses the image from part (a).`,
    markscheme: `(a)(i) [1] 3
(a)(ii) [3] 36 pixels × 3 bits = 108 bits = 13.5 bytes
(b)(i) [4] 2.5e9 × 4 = 1e10 bytes = 10GB
(b)(ii) [4] Cropping (lossy), Reducing resolution (lossy), RLE (lossless), Reducing colour depth (lossy)
(c) [3] Looks for runs of same colour; stores colour value + count; lossless method`,
  },
  {
    id: 22,
    question: `Register X = 11110010.
(i) Convert as unsigned binary to denary.
(ii) Convert to hexadecimal.
(iii) Convert as two's complement to denary.`,
    markscheme: `(i) [1] 242
(ii) [1] F2
(iii) [1] -14`,
  },
  {
    id: 23,
    question: `(a) Define sampling rate and explain its influence on accuracy.
(b)(i) Define pixel and screen resolution.
(b)(ii) How many pixels stored in one byte for a monochrome image?
(b)(iii) File size in KB for image 2048×512 with 256 colours.
(b)(iv) State one extra data item stored in a bitmap file header.`,
    markscheme: `(a) [2] Sampling rate = samples per second; higher rate → better accuracy, smaller quantisation error
(b)(i) [2] Pixel = smallest picture element; screen resolution = number of pixels horizontally and vertically
(b)(ii) [1] 8
(b)(iii) [3] 2048×512=1,048,576 pixels; 256 colours→1 byte/pixel; 1,048,576/1024=1024KB
(b)(iv) [1] e.g. file type, file size, image dimensions, colour depth, compression type`,
  },
  {
    id: 24,
    question: `(a) Define sampling resolution and effect on accuracy.
(b)(i) Define image resolution.
(b)(ii) Bits per pixel for 16-colour image.
(b)(iii) File size in KB for image 8192×256 with 256 colours.
(b)(iv) State two items in a file header.`,
    markscheme: `(a) [2] Sampling resolution = bits per sample; higher → more accurate, larger file
(b)(i) [1] Number of pixels per unit length or total pixels in image
(b)(ii) [1] 4 bits
(b)(iii) [3] 8192×256=2,097,152 pixels; 256 colours→1 byte/pixel; 2,097,152/1024=2048KB
(b)(iv) [2] e.g. file type, file size, image dimensions, colour depth, compression type`,
  },
  {
    id: 25,
    question: `(a) Define sampling rate and influence on accuracy.
(b)(i) Define pixel and screen resolution.
(b)(ii) Pixels per byte for monochrome image.
(b)(iii) File size in KB for image 2048×512 with 256 colours.
(b)(iv) One extra data item stored in a bitmap file.`,
    markscheme: `(a) [2] Sampling rate = samples per second; higher rate → better accuracy
(b)(i) [2] Pixel = smallest picture element; screen resolution = number of pixels in both dimensions
(b)(ii) [1] 8
(b)(iii) [3] 1,048,576 pixels; 1 byte/pixel; 1024KB
(b)(iv) [1] e.g. colour depth, file size, image dimensions`,
  },
  {
    id: 26,
    question: `(a) Two's complement:
(i) Convert 01110111 to denary.
(ii) Convert 10001000 to denary using two's complement.
(iii) Represent -17 in 8-bit two's complement.
(iv) State the range of values for single-byte two's complement.
(b)(i) Represent 653 in BCD.
(b)(ii) Explain why 0100 1110 0010 is invalid BCD.
(b)(iii) State a practical application of BCD.`,
    markscheme: `(a)(i) [1] 119
(a)(ii) [1] -120
(a)(iii) [1] 1110 1111
(a)(iv) [1] Lowest -128, highest +127
(b)(i) [1] 0110 0101 0011
(b)(ii) [1] Second block 1110 = 14 which is greater than 9
(b)(iii) [1] Electronic device displaying numeric digits e.g. calculator`,
  },
  {
    id: 27,
    question: `(a) Convert 55 to 8-bit binary.
(b) Convert BCD 10000011 to denary.
(c) Represent a negative number in 8-bit two's complement.
(d) Convert 4E hexadecimal to denary.`,
    markscheme: `(a) [1] 00110111
(b) [1] 83
(c) [2] 10011010
(d) [2] 78`,
  },
  {
    id: 28,
    question: `A school has a radio station.
(a) Describe how sound clips are sampled.
(b)(i) State whether lossy or lossless compression is appropriate for a sound clip. Justify your choice.
(b)(ii) Explain run-length encoding.
(b)(iii) Apply RLE to given image rows with colour codes 153=black, 255=white.`,
    markscheme: `(a) [3] Amplitude measured at regular intervals; encoded as binary numbers
(b)(i) [3] Lossy – human ear won't notice loss; smaller file for email; etc.
(b)(ii) [3] Stores colour and number of times it repeats; stores run count + colour code
(b)(iii) [2] Row1: 153 10 255 3 153 3; Row2: 153 9 255 6 153 1; Row3: 153 7 255 9`,
  },
  {
    id: 29,
    question: `(a) Convert 01001101 to denary.
(b) Represent 82 in BCD.
(c) Convert 11001011 as two's complement to denary.
(d) Convert 198 to hexadecimal.`,
    markscheme: `(a) [1] 77
(b) [1] 1000 0010
(c) [2] -53
(d) [2] C6`,
  },
  {
    id: 30,
    question: `(a)(i) Convert 46 to 8-bit binary.
(a)(ii) Convert -46 to 8-bit two's complement.
(a)(iii) Convert 46 to hexadecimal.
(b)(i) Explain how to convert a denary number greater than 9 to BCD with an example.
(b)(ii) Explain how to convert 8-bit BCD to denary with an example.`,
    markscheme: `(a)(i) [1] 00101110
(a)(ii) [1] 11010010
(a)(iii) [1] 2E
(b)(i) [2] Each denary digit → 4-bit binary; e.g. 46 = 0100 0110
(b)(ii) [2] Split into 4-bit groups, convert each to denary; e.g. 0011 0111 = 37`,
  },
  {
    id: 31,
    question: `(a) Define frame rate.
(b) Describe interlaced and progressive encoding.`,
    markscheme: `(a) [1] Number of frames/images displayed or recorded per second
(b) [4] Interlaced: frame split into two fields odd/even; alternating display; two frames simultaneously; halves bandwidth. Progressive: complete image per frame; all scan lines stored; frames in sequence at frame rate`,
  },
  {
    id: 32,
    question: `(c)(i) Name the video term for each: "Pixels in two video frames have the same value in the same location" and "A sequence of pixels in a single frame have the same value".
(c)(ii) State one file technique applied when these features are present.`,
    markscheme: `(c)(i) [2] Temporal redundancy; Spatial redundancy
(c)(ii) [1] (File) compression`,
  },
  {
    id: 33,
    question: `Draw lines linking hexadecimal, BCD, and binary representations to their corresponding denary values. (Diagram-based matching question)`,
    markscheme: `[1 mark per correct link] Correct matching of hexadecimal, BCD and binary values to their denary equivalents`,
  },
  {
    id: 34,
    question: `(i) Convert 10111000 to hexadecimal.
(ii) Represent 97 in BCD.
(iii) Represent 114 and -93 in 8-bit two's complement.`,
    markscheme: `(i) [1] B8
(ii) [1] 1001 0111
(iii) [2] 114 = 01110010; -93 = 10100011`,
  },
  {
    id: 35,
    question: `(a)(i) Define sampling.
(a)(ii) Explain why 16-bit sampling is used on audio CDs.
(a)(iii) Explain sampling resolution.
(a)(iv) State one benefit and one drawback of higher sampling resolution.
(b) Describe two features of sound editing software.
(c) Explain the difference between lossless and lossy compression.`,
    markscheme: `(a)(i) [1] Measurement of analogue signal at regular time intervals
(a)(ii) [1] Sufficient bit depth for good quality; compromise between quality and file size
(a)(iii) [2] Number of distinct values per sample (bits per sample); higher → smaller quantisation error
(a)(iv) [2] Benefit: larger dynamic range/more accurate. Drawback: larger files/slower transmission
(b) [2] e.g. edit start/stop time, fade in/out, mix tracks, change pitch
(c) [3] Lossless: no data lost, original exactly recreated e.g. RLE. Lossy: some detail lost, smaller file e.g. MP3`,
  },
  {
    id: 36,
    question: `(a)(i) Represent 124 and -77 in 8-bit two's complement.
(a)(ii) Convert those values to hexadecimal.
(b)(i) Represent 359 in BCD.
(b)(ii) State a use of BCD.`,
    markscheme: `(a)(i) [2] 124 = 01111100; -77 = 10110011
(a)(ii) [2] 124 = 7C; -77 = B3
(b)(i) [1] 0011 0101 1001
(b)(ii) [2] Calculator displays; accurate representation of decimal fractions`,
  },
  {
    id: 37,
    question: `(a) Link graphics terms to descriptions: bitmap graphic, pixel, vector graphic.
(b)(i) A black and white image is 512×256 pixels. Calculate the file size in KB.
(b)(ii) State why it is important to estimate file size.`,
    markscheme: `(a) [1 per link] Bitmap graphic – rows/columns of pixels; Pixel – smallest picture element; Vector graphic – drawing objects/instructions
(b)(i) [2] 512×256 / (8×1024) = 16KB
(b)(ii) [1] To estimate storage capacity or whether it can be emailed`,
  },
  {
    id: 38,
    question: `A touch screen displays coloured squares.
(a)(i) Convert binary memory contents to hexadecimal.
(a)(ii) Convert 40 to binary.
(b)(i) State the number of bits per pixel for a black and white image.
(b)(ii) State and explain bits per pixel for 256 colours.
(c)(i) Describe lossless compression.
(c)(ii) Describe lossy compression.`,
    markscheme: `(a)(i) [1] 46C
(a)(ii) [1] 101000
(b)(i) [1] 1 bit
(b)(ii) [2] 8 bits because 256 = 2⁸
(c)(i) [2] No data lost; original recreated exactly; uses replacement techniques e.g. RLE
(c)(ii) [2] Some detail lost; discards information e.g. sounds humans can't hear; may then apply lossless`,
  },
  {
    id: 39,
    question: `(a) Explain sampling resolution and sampling rate.
(b)(i) A CD uses 44100 samples/sec, 16 bits/sample, stereo. Calculate bytes per second.
(b)(ii) Explain how to calculate file size in MB for a 4-minute track.`,
    markscheme: `(a) [4] Sampling resolution = bits per sample (higher = less distortion). Sampling rate = samples per second (higher = more accurate)
(b)(i) [2] 44100 × 16 × 2 / 8 = 176400 bytes
(b)(ii) [2] Multiply bytes per second by 240 (4 min × 60), then divide by 1,048,576`,
  },
  {
    id: 40,
    question: `(c)(i) State two disadvantages of ASCII.
(c)(ii) Explain how Unicode overcomes these disadvantages.`,
    markscheme: `(c)(i) [2] Only 128/256 characters; cannot represent many languages; extended ASCII varies between systems
(c)(ii) [2] Uses 16/24/32 bits; superset of ASCII; can represent most characters from all languages`,
  },
];