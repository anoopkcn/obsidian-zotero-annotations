## README
Import PDF annotation notes and metadata from Zotero to Obsidian.

## A Zotero locale bug (when using AM/PM time stamps)
On Zotero version 6.X and below there is a bug related to sorting the annotation files(generated with `Add note from annotations`). Since annotations are sorted alphabetically they might appear in the wrong order if you use AM/PM time format. 

**FIX:** One should use the 24-hour format for time stamps in Zotero. Change locale using `Settings->Advanced->Language->English(UK).

**This is a Zotero bug and not related to this plugin** 

## Related  or Similar Plugins
This work is inspired by the plugins mentioned in this section. I used all of them and didn't like some of the features. Or some functions that I wanted were not available. So I decided to borrow some of their code and make my own plugin. Thanks to the authors. Please try these plugins. They are great.

[stefanopagliari/bibnotes](https://github.com/stefanopagliari/bibnotes)

[hans/obsidian-citation-plugin](https://github.com/hans/obsidian-citation-plugin)

[mgmeyers/obsidian-zotero-integration](https://github.com/mgmeyers/obsidian-zotero-integration)