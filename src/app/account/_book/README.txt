Place the un-watermarked master PDFs here, named exactly:

    unretire-book-master.pdf        (the book)
    unretire-workbook-master.pdf    (the workbook)

This folder is OUTSIDE /public, so the files are never served directly —
only the /unretire/api/book-download server route can read them, and only
after confirming the user has premium access. It watermarks each page with
"Private Copy — [user's name]" (two diagonal stamps, left and right) and
streams the result to the browser.

The route picks the file from the request: { type: "book" } or
{ type: "workbook" }.

Do NOT put the masters in /public/ — that would let anyone download the
clean, un-watermarked copies by URL.
