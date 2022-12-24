## README
This is a refactored version of the original [stefanopagliari/bibnotes](https://github.com/stefanopagliari/bibnotes) repository. The original repository is still available.

**NOTE:** I created this for personal usage. It might not be fit for your usage since I don't provide support. 

**Please check the original at  https://github.com/stefanopagliari/bibnotes**

### A Zotero locale bug (when using AM/PM time stamps)
On Zotero version 6.X and below there is a bug related to sorting the annotation files(generated with `Add note from annotations`). Since annotations are sorted alphabetically they might appear in the wrong order if you use AM/PM time format. Therefore one should use the 24-hour format for time stamps(change locale using `Settings--> Advanced-->Language-->English(UK)). **This is a Zotero bug and not related to this plugin** 


### Changes
- [x] Simplified restructured source code and refactoring.
- [x] Remove packages that provide limited functionality but are heavy.
- [x] Simplified settings tab.
- [x] Update reference files without modal.
- [x] Template from a template file.
- [x] Open after importing a note(settings can be changed).
- [x] Fetch only the latest annotation file from Zotero instead of all annotations.
- [x] Fix : page reference associated with images.
- [x] Modal suggestions contain formatted information.
- [ ] Commands to insert markdown and wikki links.
- [ ] Custom import styles and colors for annotations (using css).