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
    question: `Samira uses a computer to draw a logo and saves it as a vector graphic.
(i) Describe how the logo is represented by the computer.
(ii) State two reasons why the hotel logo is saved as a vector graphic instead of a bitmapped graphic.`,
    markscheme: `(i) [3] Series of geometric shapes/objects; stored coordinates; drawing list/commands/formulae; attributes/properties e.g. colour, thickness
(ii) [2] Needs to be large for signs without pixelation; smaller file size`,
  },
  {
    id: 3,
    question: `Amir has created a sound file.
(a) Define sampling and sampling resolution.
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
(b) Logo is 160x160 pixels, colour depth 3 bytes per pixel. Calculate file size in KB.
(c) State one benefit of a vector graphic over a bitmap for the logo.
(d) Convert hex colour #913C8E to denary values for R, G, B.`,
    markscheme: `(a) [2] 1 mark for feature + 1 for expansion e.g. colour select, add text, resize, fill, copy
(b) [3] 160x160=25600 pixels; x3=76800 bytes; 75KB
(c) [2] Enlarged without pixelation; smaller file size
(d) [2] Red=145, Green=60, Blue=142`,
  },
  {
    id: 6,
    question: `A recording of a concert is streamed after lossy compression.
(i) State why compression is needed.
(ii) Explain why lossy is more appropriate than lossless for this file.`,
    markscheme: `(i) [1] Data files very large; faster download; less bandwidth needed
(ii) [3] Lossy creates smaller file than lossless; large file needs significant reduction; loss of detail not noticed`,
  },
  {
    id: 7,
    question: `A student records a video.
(a) Describe interlaced encoding.
(b) State one benefit of interlaced versus progressive encoding.
(c) Explain how temporal redundancy compresses video.
(d) Describe how a computer encodes a sound track and explain how sampling rate and resolution affect file size.`,
    markscheme: `(a) [3] Frame split into two fields (odd/even rows); fields alternate; viewer sees data from two frames simultaneously
(b) [1] Higher perceived refresh rate; lower bandwidth
(c) [2] Identifies pixels that do not change between frames; records only differences
(d) [3+2] Amplitude measured at regular intervals; each sample stored as binary number. More samples/sec or more bits/sample -> larger file, more accurate`,
  },
  {
    id: 8,
    question: `Describe progressive encoding.`,
    markscheme: `[2] Stores all scan lines for entire frame (not split into fields); complete frames displayed in sequence; rate of picture display = frame rate`,
  },
  {
    id: 9,
    question: `(a) What does 40fps mean?
(b) State two differences between interlaced and progressive encoding.
(c) State the meaning of sampling rate 88.2 kHz and sampling resolution 32 bits.`,
    markscheme: `(a) [1] 40 images/frames displayed/recorded per second
(b) [4] Progressive: complete image per frame; not divided into fields. Interlaced: divided into two fields odd/even; two frames simultaneously
(c) [2] 88.2kHz: sampled 88200 times per second; 32 bits: each sample stored as 32-bit binary number`,
  },
  {
    id: 10,
    question: `(a) State number of colours for 8-bit depth; convert 0100 1110 to denary.
(b) Convert -194 to 12-bit two's complement.
(c)(i) Convert BCD 0110 1001 to denary. (c)(ii) One practical use of BCD.
(d) Describe how one character is represented in a character set.
(e) Lossy or lossless for: (i) high-level language program, (ii) photo to email, (iii) video to website.`,
    markscheme: `(a)(i) [1] 256
(a)(ii) [1] 78
(b) [1] 1111 0011 1110
(c)(i) [1] 69
(c)(ii) [1] Calculator/digital clock
(d) [2] Each character has unique denary/hex/binary number
(e)(i) [2] Lossless – program won't run if data lost
(e)(ii) [2] Lossy – colours reduced unnoticeably; email needs smaller file
(e)(iii) [2] Lossy – quality loss not noticed; faster upload`,
  },
  {
    id: 11,
    question: `Dominic's tablet captures video.
(i) Describe how images and sound are encoded digitally.
(ii) Describe interlaced and progressive encoding.
(iii) Define temporal and spatial redundancy.`,
    markscheme: `(i) [4] Images: bitmaps of pixels, each colour unique binary. Sound: amplitude at regular intervals, each to binary
(ii) [4] Interlaced: split into two fields even/odd, alternating, two frames simultaneously. Progressive: entire frame at once, rate = frame rate
(iii) [2] Temporal: same pixel values across consecutive frames. Spatial: consecutive pixels same frame have same value`,
  },
  {
    id: 12,
    question: `Leonardo records voice.
(i) Describe how sound sampling encodes sound.
(ii) Effect of 44100 Hz versus 21000 Hz on recording and file size.
(iii) Name two sound editing software features and their purposes.`,
    markscheme: `(i) [2] Amplitude measured at regular intervals; value stored as binary
(ii) [2] Higher rate -> larger file, more accurate; lower rate -> smaller file, less accurate
(iii) [4] e.g. Amplify (increase volume), Change pitch, Cut/delete, Copy/paste`,
  },
  {
    id: 13,
    question: `A logo is stored as a bitmap image.
(a) Describe what a bitmap image is.
(b) Explain how RLE compresses a black and white bitmap.
(c) Logo 500x1000 pixels, 35 colours. Estimate file size in KB.
(d) State two benefits of vector graphic versus bitmap.`,
    markscheme: `(a) [2] Made of pixels; each pixel one colour; colour stored as binary
(b) [2] Stores colour and number of times it occurs e.g. B5 W1
(c) [4] 500x1000=500000 pixels; 35 colours->6bits/pixel; 500000x6/8=375000 bytes=375KB
(d) [4] Resize without pixelation; smaller file size`,
  },
  {
    id: 14,
    question: `A student recorded a sound track.
(a) Explain how an analogue sound wave is sampled to produce a digital sound file.
(b) Explain the effect of changing sampling rate from 44.1 kHz to 22.05 kHz.
(c) Describe two features of sound editing software and their purpose.`,
    markscheme: `(a) [3] Amplitude measured at regular intervals; value recorded as binary number
(b) [3] Fewer samples per sec -> file size decreases; larger gaps -> less accurate sound
(c) [4] e.g. Fading (change volume), Removing sound (delete sections), Copy (repeat elements)`,
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
(d) State purpose of file header and give two examples.
(e) Describe three graphics software features and their effects.`,
    markscheme: `(a) [1] 1
(b) [3] Correct RLE encoding with colour/count groupings
(c) [1] 5
(d) [3] Purpose: stores metadata. Examples: file type, file size, image dimensions, colour depth
(e) [6] e.g. Resize, Crop, Blur, Red eye reduction – each named + effect`,
  },
  {
    id: 17,
    question: `A student is creating a video with background music.
(a) Explain how a microphone captures music.
(b) Explain how sampling resolution affects the sound file.
(c) Describe two sound editing software features.
(d) What does 60 fps mean? Describe progressive encoding.
(e) What is a multimedia container format?`,
    markscheme: `(a) [3] Diaphragm vibrates with sound waves; coil moves past magnet; electric current generated
(b) [3] Sampling resolution = bits per sample; higher -> larger file, more accurate
(c) [4] e.g. Cut/delete, Copy/paste, Amplify
(d) [3] 60 images recorded per second. Each frame contains complete image; all frame data recorded at same time
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
(a) A 4-colour bitmap image has a 6x6 pixel grid. Calculate minimum bits per pixel and minimum file size.
(b) A photograph is 1000x1000 pixels, 2 bytes per pixel. Calculate file size in MB.
(c) State two reasons why a vector graphic is sensible for the company logo.`,
    markscheme: `(a) [4] 2 bits per pixel; 36 pixels x 2 bits = 72 bits = 9 bytes
(b) [4] 1,000,000 x 2 = 2,000,000 bytes = 2MB
(c) [4] Smaller file size -> faster transfer; enlarges without pixelation`,
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
(a) A 6-colour bitmap has a 6x6 pixel grid. Calculate minimum bits per pixel and minimum file size.
(b) A photograph is 50000x50000 pixels, 4 bytes per pixel. Calculate file size in GB.
(c) Explain how RLE compresses the image.`,
    markscheme: `(a) [4] 3 bits per pixel; 36 x 3 = 108 bits = 13.5 bytes
(b) [4] 2.5e9 x 4 = 1e10 bytes = 10GB
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
(b) Define pixel and screen resolution.
(c) How many pixels stored in one byte for a monochrome image?
(d) Calculate file size in KB for image 2048x512 with 256 colours.
(e) State one extra data item stored in a bitmap file header.`,
    markscheme: `(a) [2] Sampling rate = samples per second; higher rate -> better accuracy
(b) [2] Pixel = smallest picture element; screen resolution = number of pixels horizontally and vertically
(c) [1] 8
(d) [3] 2048x512=1,048,576 pixels; 256 colours->1 byte/pixel; 1024KB
(e) [1] e.g. file type, file size, image dimensions, colour depth`,
  },
  {
    id: 24,
    question: `(a) Define sampling resolution and its effect on accuracy.
(b) Define image resolution and state bits per pixel for a 16-colour image.
(c) Calculate file size in KB for image 8192x256 with 256 colours.
(d) State two items in a file header.`,
    markscheme: `(a) [2] Sampling resolution = bits per sample; higher -> more accurate, larger file
(b) [2] Number of pixels per unit length; 4 bits per pixel
(c) [3] 8192x256=2,097,152 pixels; 1 byte/pixel; 2048KB
(d) [2] e.g. file type, file size, image dimensions, colour depth`,
  },
  {
    id: 25,
    question: `(a) Define sampling rate and its influence on accuracy.
(b) Define pixel and screen resolution. How many pixels per byte for a monochrome image?
(c) Calculate file size in KB for image 2048x512 with 256 colours.`,
    markscheme: `(a) [2] Sampling rate = samples per second; higher rate -> better accuracy
(b) [3] Pixel = smallest picture element; screen resolution = number of pixels in both dimensions; 8 pixels per byte
(c) [3] 1,048,576 pixels; 1 byte/pixel; 1024KB`,
  },
  {
    id: 26,
    question: `(a) Two's complement:
(i) Convert 01110111 to denary.
(ii) Convert 10001000 to denary.
(iii) Represent -17 in 8-bit two's complement.
(iv) State the range of values for single-byte two's complement.
(b) Represent 653 in BCD. Explain why 0100 1110 0010 is invalid BCD. State a practical use of BCD.`,
    markscheme: `(a)(i) [1] 119
(a)(ii) [1] -120
(a)(iii) [1] 1110 1111
(a)(iv) [1] -128 to +127
(b) [3] 0110 0101 0011; Second block 1110=14 > 9 invalid; calculator/digital clock`,
  },
  {
    id: 27,
    question: `(a) Convert 55 to 8-bit binary.
(b) Convert BCD 10000011 to denary.
(c) Represent -102 in 8-bit two's complement.
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
(b) Is lossy or lossless compression appropriate for a sound clip? Justify your choice.
(c) Explain run-length encoding.`,
    markscheme: `(a) [3] Amplitude measured at regular intervals; encoded as binary numbers
(b) [3] Lossy – human ear won't notice loss; smaller file for streaming
(c) [3] Stores colour and number of times it repeats; stores run count + colour code`,
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
    question: `(a) Convert 46 to 8-bit binary, to -46 in two's complement, and to hexadecimal.
(b) Explain how to convert a denary number to BCD and back with examples.`,
    markscheme: `(a) [3] 00101110; 11010010; 2E
(b) [4] Each denary digit -> 4-bit binary e.g. 46=0100 0110; Split into 4-bit groups convert each to denary e.g. 0011 0111=37`,
  },
  {
    id: 31,
    question: `(a) Define frame rate.
(b) Describe interlaced and progressive encoding.`,
    markscheme: `(a) [1] Number of frames/images displayed or recorded per second
(b) [4] Interlaced: frame split into two fields odd/even; alternating; two frames simultaneously. Progressive: complete image per frame; frames in sequence at frame rate`,
  },
  {
    id: 32,
    question: `(i) Name the video term for: "Pixels in two video frames have the same value in the same location" and "A sequence of pixels in a single frame have the same value".
(ii) State one file technique applied when these features are present.`,
    markscheme: `(i) [2] Temporal redundancy; Spatial redundancy
(ii) [1] (File) compression`,
  },
  {
    id: 33,
    question: `Link hexadecimal, BCD, and binary representations to their corresponding denary values. (Matching question: hex B4, BCD 0001 0111, binary 10110100 all link to denary 180, 23, 180 respectively)`,
    markscheme: `[1 mark per correct link] Correct matching of hexadecimal, BCD and binary values to their denary equivalents`,
  },
  {
    id: 34,
    question: `(i) Convert 10111000 to hexadecimal.
(ii) Represent 97 in BCD.
(iii) Represent 114 and -93 in 8-bit two's complement.`,
    markscheme: `(i) [1] B8
(ii) [1] 1001 0111
(iii) [2] 114=01110010; -93=10100011`,
  },
  {
    id: 35,
    question: `(a) Define sampling and sampling resolution. State one benefit and one drawback of higher sampling resolution.
(b) Describe two features of sound editing software.
(c) Explain the difference between lossless and lossy compression.`,
    markscheme: `(a) [4] Sampling = measurement at regular intervals. Resolution = bits per sample; higher -> smaller quantisation error but larger files
(b) [2] e.g. fade in/out, mix tracks, change pitch, edit start/stop time
(c) [3] Lossless: no data lost, original exactly recreated e.g. RLE. Lossy: some detail lost, smaller file e.g. MP3`,
  },
  {
    id: 36,
    question: `(a) Represent 124 and -77 in 8-bit two's complement and convert both to hexadecimal.
(b) Represent 359 in BCD. State a use of BCD.`,
    markscheme: `(a) [4] 124=01111100=7C; -77=10110011=B3
(b) [3] 0011 0101 1001; calculator displays / accurate representation of decimal fractions`,
  },
  {
    id: 37,
    question: `(a) Define bitmap graphic, pixel, and vector graphic.
(b) A black and white image is 512x256 pixels. Calculate the file size in KB. Why is it important to estimate file size?`,
    markscheme: `(a) [3] Bitmap = rows/columns of pixels; Pixel = smallest picture element; Vector = drawing objects/instructions
(b) [3] 512x256/8/1024=16KB; to estimate storage capacity or whether it can be emailed`,
  },
  {
    id: 38,
    question: `(a) Convert binary 0100 0110 1100 to hexadecimal. Convert 40 to binary.
(b) State bits per pixel for a black and white image and for 256 colours.
(c) Describe lossless and lossy compression.`,
    markscheme: `(a) [2] 46C; 101000
(b) [3] 1 bit for black and white; 8 bits because 256=2^8
(c) [4] Lossless: no data lost; original recreated exactly e.g. RLE. Lossy: some detail lost; discards data e.g. sounds humans can't hear`,
  },
  {
    id: 39,
    question: `(a) Explain sampling resolution and sampling rate.
(b) A CD uses 44100 samples/sec, 16 bits/sample, stereo. Calculate bytes per second and explain how to calculate file size in MB for a 4-minute track.`,
    markscheme: `(a) [4] Sampling resolution = bits per sample (higher = less distortion). Sampling rate = samples per second (higher = more accurate)
(b) [4] 44100 x 16 x 2 / 8 = 176400 bytes per second; x240 seconds / 1048576 = approx 40MB`,
  },
  {
    id: 40,
    question: `(i) State two disadvantages of ASCII.
(ii) Explain how Unicode overcomes these disadvantages.`,
    markscheme: `(i) [2] Only 128/256 characters; cannot represent many languages; extended ASCII varies between systems
(ii) [2] Uses 16/24/32 bits; superset of ASCII; can represent most characters from all languages`,
  },
];