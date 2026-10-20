.PHONY: validate demos site clean

validate:
	node scripts/validate-styles.mjs

demos:
	node scripts/render-demos.mjs

site:
	open site/index.html

clean:
	rm -f renders/*.mp4 previews/*.jpg
