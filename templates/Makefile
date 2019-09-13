SRCS=$(wildcard *.heml)

OBJS=$(SRCS:.heml=.html)

%.html: %.heml
	../node_modules/.bin/heml build $<

all: $(OBJS)

.PHONY: clean
clean:
	rm -vf *.html
