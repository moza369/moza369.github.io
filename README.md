# MOZA — Cybersecurity • AI • Research

Personal technical blog, CTF writeup archive, and security research portfolio.

**Live site:** [moza369.github.io](https://moza369.github.io/)

## Tech Stack

- [Hugo](https://gohugo.io/) — Static site generator
- Custom `moza` theme — Clean, professional, light-first design
- GitHub Pages — Hosting & deployment
- GitHub Actions — CI/CD

## Local Development

```bash
# Clone with submodules
git clone --recursive https://github.com/moza369/moza369.github.io.git
cd moza369.github.io

# Run development server
hugo server -D

# Build for production
hugo --minify
```

## Creating New Content

```bash
# New blog post
hugo new post/my-new-post.md

# New writeup (page bundle with images)
mkdir -p content/writeups/my-writeup
hugo new writeups/my-writeup/index.md

# New project
hugo new projects/my-project/index.md
```

</script>
## License

MIT
